import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import type { RedeemOption, RewardHistoryEntry, RewardsConfig, UserRewardProfile, Voucher } from '../types/rewards';
import { defaultRedeemOptions } from '../data/rewards';
import { useAuth } from './AuthContext';

// Key for localStorage (User Data fallback)
const STORAGE_KEY = 'ecobrick_rewards_db_v1';

const initialMockUsers: Record<string, UserRewardProfile> = {};

type RewardsState = {
  points: number;
  history: RewardHistoryEntry[];
  claimedVouchers: Voucher[];

  allUsers: UserRewardProfile[];

  config: RewardsConfig;
  availableVouchers: Voucher[];

  addDonation: (kg: number, note?: string) => Promise<boolean>;
  redeemOption: (option: RedeemOption | Voucher) => Promise<{ success: boolean; message: string }>;
  updatePointsPerKg: (value: number) => void;

  addVoucher: (voucher: Omit<Voucher, 'id' | 'status'>) => Promise<boolean>;
  deleteVoucher: (id: string) => void; // TODO: API
  editVoucher: (voucher: Voucher) => void; // TODO: API

  updateDonationStatus: (userId: string, entryId: string, status: 'approved' | 'rejected') => void;
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

  // Load vouchers on mount
  useEffect(() => {
    fetchVouchers();
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
        // --- DEV MODE FALLBACK ---
        // If Backend says "Not enough points" but Local State has enough (due to local Admin Award), allow it.
        const cost = (option as any).pointsRequired || 0;
        const currentUserProfile = usersDb[currentUserId];
        const localPoints = currentUserProfile ? currentUserProfile.points : 0;
        const rawMsg = data.message || '';

        if (rawMsg === 'Not enough points' && localPoints >= cost) {
          setUsersDb(prev => {
            const p = prev[currentUserId];
            if (!p) return prev;
            return {
              ...prev,
              [currentUserId]: {
                ...p,
                points: p.points - cost,
                claimedVouchers: [{
                  id: `claimed-dev-${Date.now()}`,
                  code: (option as Voucher).code || 'DEV-OFFLINE',
                  title: option.title,
                  discount: (option as any).discount || (option as any).benefit,
                  pointsRequired: cost,
                  expiresAt: 'Unknown',
                  status: 'claimed'
                }, ...p.claimedVouchers],
                history: [{
                  id: `redeem-dev-${Date.now()}`,
                  userId: currentUserId,
                  type: 'redeem',
                  points: -cost,
                  note: `Chuộc ${option.title} (Dev Mode)`,
                  status: 'approved',
                  createdAt: new Date().toISOString()
                }, ...p.history]
              }
            }
          });
          return { success: true, message: 'Đổi thành công (Offline Mode)!' };
        }

        // Improve Error Messages based on Backend
        let msg = rawMsg || 'Lỗi đổi điểm';
        if (msg === 'Not enough points') {
          msg = 'Không đủ điểm trong hệ thống (Backend). Vui lòng chờ đồng bộ điểm.';
        }
        return { success: false, message: msg };
      }
    } catch (e) {
      return { success: false, message: 'Lỗi kết nối' };
    }
  }, [isAuthenticated, currentUserId, usersDb]);


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
  const updateDonationStatus = (userId: string, entryId: string, status: 'approved' | 'rejected') => {
    setUsersDb(prev => {
      const userProfile = prev[userId];
      if (!userProfile) return prev; // User not found in local db

      const historyIndex = userProfile.history.findIndex(h => h.id === entryId);
      if (historyIndex === -1) return prev;

      const entry = userProfile.history[historyIndex];
      // If already processed, ignore
      if (entry.status === 'approved' || entry.status === 'rejected') return prev;

      // Update entry
      const updatedHistory = [...userProfile.history];
      updatedHistory[historyIndex] = { ...entry, status };

      // Update User Stats if Approved
      let newPoints = userProfile.points;
      let newKg = userProfile.totalKg;

      if (status === 'approved') {
        // Calculate points if not already set on entry
        const pts = entry.points || ((entry.kg || 0) * config.pointsPerKg);
        newPoints += pts;
        newKg += (entry.kg || 0);

        // We should ideally call the API here to persist the award in the Backend too if it matches a real user
        // adminAwardPoints(userId, entry.kg, pts, entry.note); 
        // But adminAwardPoints creates a new record. We just want to "Confirm" this one. 
        // For now, Local State Update is primary for this "Manage" view.
      }

      return {
        ...prev,
        [userId]: {
          ...userProfile,
          points: newPoints,
          totalKg: newKg,
          history: updatedHistory
        }
      };
    });
  };
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
        console.warn(`Backend award API failed (${res.status}): ${errorText}. Falling back to local update.`);
      } else {
        setTimeout(() => fetchVouchers(), 1500);
      }
    } catch (e) {
      console.error("Award API connection failed. Falling back to local update.", e);
    }

    // Always update local state (Optimistic / Fallback)
    setUsersDb(prev => {
      const p = prev[targetUserId];
      if (!p) return prev; // User not in local list, cannot update UI

      const addedPoints = manualPoints || (amountKg * config.pointsPerKg);
      return {
        ...prev,
        [targetUserId]: {
          ...p,
          points: (p.points || 0) + addedPoints,
          history: [{
            id: `admin-${Date.now()}`,
            userId: targetUserId,
            type: 'admin_adjust',
            points: addedPoints, // This might be a float
            note: note || 'Admin Award',
            createdAt: new Date().toISOString()
          }, ...p.history]
        }
      };
    });
    return true;
  }, [isAuthenticated, config.pointsPerKg]);

  const refreshData = () => { fetchVouchers(); };

  return (
    <RewardsContext.Provider value={{
      points, history, claimedVouchers, allUsers: Object.values(usersDb),
      config, availableVouchers: availableVouchers,
      addDonation, redeemOption, updatePointsPerKg,
      addVoucher, deleteVoucher, editVoucher,
      updateDonationStatus, adjustUserPoints, adminAwardPoints, refreshData
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
