import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import type { AdminPendingDonation, RedeemOption, RewardHistoryEntry, RewardsConfig, UserRewardProfile, Voucher } from '../types/rewards';
import { defaultRedeemOptions } from '../data/rewards';
import { useAuth } from './AuthContext';

// Key for localStorage (User Data fallback)
const STORAGE_KEY = 'ecobrick_rewards_db_v1';

const initialMockUsers: Record<string, UserRewardProfile> = {};

type RewardsState = {
  points: number;
  history: RewardHistoryEntry[];
  claimedVouchers: Voucher[];
  pendingDonations: AdminPendingDonation[];

  allUsers: UserRewardProfile[];

  config: RewardsConfig;
  availableVouchers: Voucher[];

  addDonation: (kg: number, note?: string) => Promise<boolean>;
  redeemOption: (option: RedeemOption | Voucher) => Promise<{ success: boolean; message: string }>;
  updatePointsPerKg: (value: number) => void;

  addVoucher: (voucher: Omit<Voucher, 'id' | 'status'>) => Promise<boolean>;
  deleteVoucher: (id: string) => void; // TODO: API
  editVoucher: (voucher: Voucher) => void; // TODO: API

  reviewDonationRequest: (userId: string, entryId: string, status: 'approved' | 'rejected') => Promise<boolean>;
  adjustUserPoints: (userId: string, points: number, reason: string) => void;
  adminAwardPoints: (targetUserId: string, amountKg: number, manualPoints?: number, note?: string) => Promise<boolean>;
  refreshData: () => void;
};

const RewardsContext = createContext<RewardsState | undefined>(undefined);

export function RewardsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  // Local DB for Legacy Stuff (Donation History, User Points) - Ideally this should also be API
  // But for now, we keep the Hybrid approach: 
  // Vouchers = API
  // Donations = API for Submit, but State for viewing? 
  //   Actually, we should fetch history from API too. But let's stick to the prompt's scope: Vouchers.

  const [usersDb, setUsersDb] = useState<Record<string, UserRewardProfile>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialMockUsers;
  });

  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [pendingDonations, setPendingDonations] = useState<AdminPendingDonation[]>([]);

  const [config, setConfig] = useState<RewardsConfig>({
    pointsPerKg: 10,
    tiers: defaultRedeemOptions,
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usersDb));
  }, [usersDb]);

  const currentUserId = user?.username || user?.id || 'guest';
  const userProfile = usersDb[currentUserId];

  // Initialize user
  useEffect(() => {
    if (isAuthenticated && currentUserId && !usersDb[currentUserId]) {
      setUsersDb(prev => ({
        ...prev,
        [currentUserId]: {
          id: currentUserId,
          name: user?.attributes?.name || user?.username || 'New User',
          email: user?.attributes?.email || '',
          points: 0,
          totalKg: 0,
          history: [],
          claimedVouchers: []
        }
      }));
    }
  }, [isAuthenticated, currentUserId, usersDb, user]);

  const points = userProfile?.points || 0;
  const history = userProfile?.history || [];
  const claimedVouchers = userProfile?.claimedVouchers || [];

  // --- API HELPER ---
  const getApiBase = () => {
    let API_URL = import.meta.env.VITE_API_URL || '';
    // Remove /donate suffix if present to get Root
    API_URL = API_URL.replace(/\/donate\/?$/, '');
    if (API_URL.endsWith('/')) API_URL = API_URL.slice(0, -1);
    return API_URL;
  }

  const getAuthToken = async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString();
    } catch {
      return null;
    }
  }

  // --- FETCH VOUCHERS ---
  const fetchVouchers = useCallback(async () => {
    if (loadingVouchers) return;
    setLoadingVouchers(true);
    try {
      // Public/Auth GET
      const API_BASE = getApiBase();
      if (!API_BASE) return;

      const token = await getAuthToken(); // Optional for GET?

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = token;

      const res = await fetch(`${API_BASE}/vouchers`, { headers });
      if (res.ok) {
        const data = await res.json();

        // Handle new response format { vouchers: [], user_points: number }
        let rawVouchers = [];
        let backendPoints = 0;

        if (Array.isArray(data)) {
          // Legacy fallback
          rawVouchers = data;
        } else if (data && typeof data === 'object') {
          rawVouchers = data.vouchers || [];
          backendPoints = data.user_points || 0;
        }

        // Map snake_case from Backend to camelCase for Frontend
        const mapped = Array.isArray(rawVouchers) ? rawVouchers.map((v: any) => ({
          id: v.id,
          title: v.title,
          discount: v.discount,
          code: v.code,
          status: v.status,
          pointsRequired: v.points_required || v.pointsRequired,
          expiresAt: v.expires_at || v.expiresAt
        })) : [];

        setAvailableVouchers(mapped);

        // Update User Points from Backend
        if (currentUserId && currentUserId !== 'guest') {
          setUsersDb(prev => {
            const profile = prev[currentUserId] || {
              id: currentUserId,
              name: user?.username || 'User',
              email: '',
              totalKg: 0,
              history: [],
              claimedVouchers: []
            };
            return {
              ...prev,
              [currentUserId]: {
                ...profile,
                points: backendPoints // SYNC POINTS FROM BACKEND
              }
            };
          });
        }
      }
    } catch (e) {
      console.error("Fetch vouchers failed", e);
    } finally {
      setLoadingVouchers(false);
    }
  }, [currentUserId, user]);

  // --- FETCH ALL USERS (Admin only) ---
  const fetchAllUsers = useCallback(async () => {
    try {
      const API_BASE = getApiBase();
      if (!API_BASE) return;

      const token = await getAuthToken();
      if (!token) return;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = token;

      const res = await fetch(`${API_BASE}/admin/users`, { headers });
      if (res.ok) {
        const data = await res.json();
        const users = data.users || [];

        // Map API response to UserRewardProfile
        const usersMap: Record<string, UserRewardProfile> = {};
        users.forEach((u: any) => {
          usersMap[u.id] = {
            id: u.id,
            name: u.name || 'Unknown',
            email: u.email || '',
            points: u.points || 0,
            totalKg: u.totalKg || 0,
            history: [],
            claimedVouchers: []
          };
        });

        // Merge with existing local data (don't overwrite history)
        setUsersDb(prev => {
          const merged = { ...prev };
          Object.keys(usersMap).forEach(userId => {
            if (merged[userId]) {
              // Keep history, update points
              merged[userId] = {
                ...merged[userId],
                ...usersMap[userId],
                history: merged[userId].history,
                claimedVouchers: merged[userId].claimedVouchers
              };
            } else {
              // New user
              merged[userId] = usersMap[userId];
            }
          });
          return merged;
        });
      }
    } catch (e) {
      console.error("Fetch all users failed", e);
    }
  }, []);

  // --- FETCH PENDING DONATIONS (Admin only) ---
  const fetchPendingDonations = useCallback(async () => {
    try {
      const API_BASE = getApiBase();
      if (!API_BASE) return;

      const token = await getAuthToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/admin/donations`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });

      if (!res.ok) {
        if (res.status === 403) {
          setPendingDonations([]);
        }
        return;
      }

      const data = await res.json();
      const donations = Array.isArray(data?.donations) ? data.donations : [];
      const mapped: AdminPendingDonation[] = donations.map((d: any) => ({
        id: String(d.id || ''),
        userId: String(d.user_id || ''),
        userName: String(d.user_name || d.user_id || 'Unknown user'),
        userEmail: String(d.user_email || ''),
        kg: Number(d.kg || 0),
        points: Number(d.points || 0),
        note: String(d.note || ''),
        status: (String(d.status || 'pending') as 'pending' | 'approved' | 'rejected'),
        createdAt: String(d.created_at || ''),
      }));

      setPendingDonations(mapped);
    } catch (e) {
      console.error('Fetch pending donations failed', e);
    }
  }, []);

  // Load admin/public data on mount
  useEffect(() => {
    fetchVouchers();
    fetchAllUsers();
    fetchPendingDonations();
  }, []);


  // --- ADD DONATION ---
  const addDonation = useCallback(async (kg: number, note = 'Quyên góp') => {
    if (!isAuthenticated) { alert("Vui lòng đăng nhập"); return false; }
    const token = await getAuthToken();
    if (!token) return false;

    const API_BASE = getApiBase();
    try {
      const res = await fetch(`${API_BASE}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ amount: kg, note })
      });
      if (res.ok) {
        alert("Gửi thành công!");
        // Optimistic update
        setUsersDb(prev => {
          const p = prev[currentUserId];
          if (!p) return prev;
          return {
            ...prev,
            [currentUserId]: {
              ...p,
              history: [{
                id: `local-${Date.now()}`,
                userId: currentUserId,
                type: 'donate',
                kg,
                points: kg * 10,
                note,
                status: 'pending',
                createdAt: new Date().toISOString()
              }, ...p.history]
            }
          };
        });
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  }, [isAuthenticated, currentUserId]);


  // --- REDEEM ---
  const redeemOption = useCallback(async (option: RedeemOption | Voucher) => {
    if (!isAuthenticated) return { success: false, message: 'Vui lòng đăng nhập' };

    const token = await getAuthToken();
    if (!token) return { success: false, message: 'Lỗi xác thực' };

    const API_BASE = getApiBase();
    const voucherId = option.id;

    try {
      const res = await fetch(`${API_BASE}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ voucher_id: voucherId })
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = { message: res.statusText };
      }

      if (res.ok) {
        // Optimistic Update
        setUsersDb(prev => {
          const p = prev[currentUserId];
          if (!p) return prev;
          const cost = (option as any).pointsRequired || 0;

          return {
            ...prev,
            [currentUserId]: {
              ...p,
              points: p.points - cost,
              claimedVouchers: [{
                id: `claimed-${Date.now()}`,
                code: (option as Voucher).code || 'PENDING',
                title: option.title,
                discount: (option as any).discount || (option as any).benefit,
                pointsRequired: cost,
                expiresAt: 'Unknown',
                status: 'claimed'
              }, ...p.claimedVouchers],
              history: [{
                id: `redeem-${Date.now()}`,
                userId: currentUserId,
                type: 'redeem',
                points: -cost,
                note: `Chuộc ${option.title}`,
                status: 'approved',
                createdAt: new Date().toISOString()
              }, ...p.history]
            }
          }
        });

        return { success: true, message: data.message || 'Đổi thành công!' };
      } else {
        const rawMsg = data.message || '';
        let msg = rawMsg || 'Lỗi đổi điểm';
        if (msg === 'Not enough points') {
          msg = 'Không đủ điểm trong hệ thống (Backend). Vui lòng chờ đồng bộ điểm.';
        }
        return { success: false, message: msg };
      }
    } catch (e) {
      return { success: false, message: 'Lỗi kết nối' };
    }
  }, [isAuthenticated, currentUserId]);


  // --- ADMIN ADD VOUCHER ---
  const addVoucher = useCallback(async (voucher: Omit<Voucher, 'id' | 'status'>) => {
    const token = await getAuthToken();
    if (!token) return false;
    const API_BASE = getApiBase();

    try {
      const res = await fetch(`${API_BASE}/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({
          title: voucher.title,
          discount: voucher.discount,
          points_required: voucher.pointsRequired,
          expires_at: voucher.expiresAt,
          code: voucher.code
        })
      });
      if (res.ok) {
        // Refresh
        fetchVouchers();
        return true;
      }
      alert("Lỗi tạo voucher");
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }, [fetchVouchers]);


  // --- LEGACY STUBS for Context Compatibility ---
  const updatePointsPerKg = (v: number) => setConfig(p => ({ ...p, pointsPerKg: v }));
  const deleteVoucher = (id: string) => { console.log("Delete not impl in Main Branch yet"); };
  const editVoucher = (v: Voucher) => { console.log("Edit not impl"); };
  const reviewDonationRequest = useCallback(async (userId: string, entryId: string, status: 'approved' | 'rejected') => {
    try {
      const API_BASE = getApiBase();
      if (!API_BASE) return false;

      const token = await getAuthToken();
      if (!token) return false;

      const res = await fetch(`${API_BASE}/admin/donations/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          user_id: userId,
          transaction_id: entryId,
          status,
        }),
      });

      if (!res.ok) {
        return false;
      }

      setPendingDonations(prev => prev.filter((item) => !(item.userId === userId && item.id === entryId)));
      fetchAllUsers();
      fetchVouchers();
      return true;
    } catch (e) {
      console.error('Review donation failed', e);
      return false;
    }
  }, [fetchAllUsers, fetchVouchers]);
  const adjustUserPoints = (uid: string, pts: number, reason: string) => { /* ... */ };
  // --- ADMIN AWARD POINTS ---
  const adminAwardPoints = useCallback(async (targetUserId: string, amountKg: number, manualPoints?: number, note?: string) => {
    if (!isAuthenticated) return false;
    const token = await getAuthToken();
    if (!token) return false;

    const API_BASE = getApiBase();
    try {
      const res = await fetch(`${API_BASE}/admin/award-points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({
          target_user_id: targetUserId,
          amount_kg: amountKg,
          manual_points: manualPoints ? Math.floor(manualPoints) : Math.floor(amountKg * config.pointsPerKg),
          note: note || 'Admin Award'
        })
      });

      if (!res.ok) {
        let errorText = '';
        try { errorText = await res.text(); } catch { }
        console.warn(`Backend award API failed (${res.status}): ${errorText}`);
        return false;
      }

      setTimeout(() => fetchVouchers(), 1500);
      fetchAllUsers();
      return true;
    } catch (e) {
      console.error('Award API connection failed.', e);
      return false;
    }
  }, [isAuthenticated, config.pointsPerKg, fetchAllUsers]);

  const refreshData = () => { 
    fetchVouchers(); 
    fetchAllUsers();
    fetchPendingDonations();
  };

  return (
    <RewardsContext.Provider value={{
      points, history, claimedVouchers, pendingDonations, allUsers: Object.values(usersDb),
      config, availableVouchers: availableVouchers,
      addDonation, redeemOption, updatePointsPerKg,
      addVoucher, deleteVoucher, editVoucher,
      reviewDonationRequest, adjustUserPoints, adminAwardPoints, refreshData
    }}>
      {children}
    </RewardsContext.Provider>
  );
}

export function useRewards() {
  const context = useContext(RewardsContext);
  if (!context) throw new Error('useRewards must be used within RewardsProvider');
  return context;
}
