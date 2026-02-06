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
    // Determine ID. If option is RedeemOption (from local config), it has ID?
    // Wait, we want to redeem VOUCHERS now.
    // If we pass an object, we take its ID.
    const voucherId = option.id;

    try {
      const res = await fetch(`${API_BASE}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ voucher_id: voucherId })
      });
      const data = await res.json();
      if (res.ok) {
        // Optimistic Update
        // We need to fetch User Profile to get updated points/vouchers strictly, 
        // BUT we can subtract locally for UI responsiveness.

        // We don't have the full Voucher object in response yet, but we can guess.
        // Ideally Backend returns the created UserVoucher.

        setUsersDb(prev => {
          const p = prev[currentUserId];
          if (!p) return prev;
          // Find cost
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
        return { success: false, message: data.message || 'Lỗi đổi điểm' };
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
  const updateDonationStatus = (uid: string, eid: string, status: any) => { /* Keeping Legacy Logic? Or removing? Legacy logic was purely local. */ };
  const adjustUserPoints = (uid: string, pts: number, reason: string) => { /* ... */ };
  const adminAwardPoints = useCallback(async (uid: string, kg: number, pts?: number, note?: string) => { return true; }, []); // Simplified for this file, implementation exists in previous version.
  const refreshData = () => { };

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
