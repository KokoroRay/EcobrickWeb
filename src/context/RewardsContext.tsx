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
import { defaultRedeemOptions, initialVouchers } from '../data/rewards';
import { useAuth } from './AuthContext';

// Key for localStorage
const STORAGE_KEY = 'ecobrick_rewards_db_v1';

// Initial Mock Data if localStorage is empty
const initialMockUsers: Record<string, UserRewardProfile> = {
  'mock-user-1': {
    id: 'mock-user-1',
    name: 'Nguyễn Văn A',
    email: 'userA@example.com',
    points: 320,
    totalKg: 32,
    history: [
      { id: 'h1', userId: 'mock-user-1', type: 'donate', kg: 32, points: 320, note: 'Initial donation', createdAt: '2026-01-01', status: 'approved' }
    ],
    claimedVouchers: []
  },
  'mock-user-2': {
    id: 'mock-user-2',
    name: 'Trần Thị B',
    email: 'userB@example.com',
    points: 540,
    totalKg: 54,
    history: [
      { id: 'h2', userId: 'mock-user-2', type: 'donate', kg: 54, points: 540, note: 'Initial donation', createdAt: '2026-01-02', status: 'approved' }
    ],
    claimedVouchers: []
  }
};

type RewardsState = {
  // Current User Data
  points: number;
  history: RewardHistoryEntry[];
  claimedVouchers: Voucher[];

  // Admin Data
  allUsers: UserRewardProfile[];

  // Shared Config
  config: RewardsConfig;
  availableVouchers: Voucher[];

  // Actions
  addDonation: (kg: number, note?: string) => Promise<boolean>;
  redeemOption: (option: RedeemOption) => { success: boolean; message: string };
  updatePointsPerKg: (value: number) => void;

  // Voucher Actions
  addVoucher: (voucher: Omit<Voucher, 'id' | 'status'>) => void;
  deleteVoucher: (id: string) => void;
  editVoucher: (voucher: Voucher) => void;

  // Admin Actions
  updateDonationStatus: (userId: string, entryId: string, status: 'approved' | 'rejected') => void;
  adjustUserPoints: (userId: string, points: number, reason: string) => void;
  adminAwardPoints: (targetUserId: string, amountKg: number, manualPoints?: number, note?: string) => Promise<boolean>;
  refreshData: () => void;
};

const RewardsContext = createContext<RewardsState | undefined>(undefined);

const createVoucherCode = (prefix: string) => {
  const stamp = Date.now().toString().slice(-5);
  return `${prefix}-${stamp}`.toUpperCase();
};

export function RewardsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  // "Database" State
  const [usersDb, setUsersDb] = useState<Record<string, UserRewardProfile>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialMockUsers;
  });

  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>(initialVouchers);
  const [config, setConfig] = useState<RewardsConfig>({
    pointsPerKg: 10,
    tiers: defaultRedeemOptions,
  });

  // Sync to local storage whenever DB changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usersDb));
  }, [usersDb]);

  // Current User Derived State
  const currentUserId = user?.username || user?.id || 'guest';
  const userProfile = usersDb[currentUserId];

  // Initialize user if not exists
  useEffect(() => {
    if (isAuthenticated && currentUserId && !usersDb[currentUserId]) {
      setUsersDb(prev => ({
        ...prev,
        [currentUserId]: {
          id: currentUserId,
          name: user?.attributes?.name || user?.username || 'Người dùng mới',
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

  const addDonation = useCallback(
    async (kg: number, note = 'Quyên góp nhựa tại điểm thu gom') => {
      if (!isAuthenticated || !currentUserId) {
        alert("Vui lòng đăng nhập để thực hiện.");
        return false;
      }

      try {
        // 1. Get Token
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        if (!token) {
          alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          return false;
        }

        // 2. Call API
        let API_URL = import.meta.env.VITE_API_URL;
        if (!API_URL) {
          console.error("VITE_API_URL is missing in .env");
          alert("Lỗi cấu hình hệ thống: Thiếu API URL.");
          return false;
        }

        // Ensure URL points to /donate endpoint
        // If API_URL is root (ends in /Prod/ or /Prod), append donate
        if (!API_URL.includes('/donate')) {
          API_URL = API_URL.endsWith('/') ? `${API_URL}donate` : `${API_URL}/donate`;
        }

        // Real API Call
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({ amount: kg, note: note })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'API Error');
        }

        // Success - Optimistic UI Update (Status: pending)
        // Note: Points are NOT added yet.
        const newEntry: RewardHistoryEntry = {
          id: `history-${Date.now()}`,
          userId: currentUserId,
          type: 'donate',
          kg,
          points: kg * config.pointsPerKg, // Display estimated points
          note,
          status: 'pending',
          createdAt: new Date().toISOString().slice(0, 10),
        };

        setUsersDb(prev => {
          const profile = prev[currentUserId];
          if (!profile) return prev;
          return {
            ...prev,
            [currentUserId]: {
              ...profile,
              history: [newEntry, ...profile.history],
            }
          };
        });

        alert("Gửi yêu cầu thành công! Vui lòng chờ Admin duyệt.");
        return true;

      } catch (error) {
        console.error("Donation Error:", error);
        alert("Có lỗi xảy ra khi gửi yêu cầu.");
        return false;
      }
    },
    [config.pointsPerKg, currentUserId, isAuthenticated]
  );

  const redeemOption = useCallback(
    (option: RedeemOption) => {
      if (!isAuthenticated || !currentUserId) return { success: false, message: 'Vui lòng đăng nhập.' };

      if (points < option.pointsRequired) {
        return { success: false, message: 'Bạn chưa đủ điểm để đổi ưu đãi này.' };
      }

      const voucher: Voucher = {
        id: `voucher-${Date.now()}`,
        title: option.title,
        code: createVoucherCode('ECO'),
        discount: option.benefit,
        pointsRequired: option.pointsRequired,
        expiresAt: '2026-12-31',
        status: 'claimed',
      };

      const newEntry: RewardHistoryEntry = {
        id: `history-${Date.now()}-redeem`,
        userId: currentUserId,
        type: 'redeem',
        points: -option.pointsRequired,
        note: `Đổi ${option.title}`,
        status: 'approved',
        createdAt: new Date().toISOString().slice(0, 10),
      };

      setUsersDb(prev => {
        const profile = prev[currentUserId];
        if (!profile) return prev;
        return {
          ...prev,
          [currentUserId]: {
            ...profile,
            points: profile.points - option.pointsRequired,
            claimedVouchers: [voucher, ...profile.claimedVouchers],
            history: [newEntry, ...profile.history]
          }
        }
      });

      return { success: true, message: 'Đổi điểm thành công! Voucher đã được thêm vào tài khoản.' };
    },
    [points, currentUserId, isAuthenticated]
  );

  // Admin: Update Donation Status
  const updateDonationStatus = useCallback((targetUserId: string, entryId: string, newStatus: 'approved' | 'rejected') => {
    setUsersDb(prev => {
      const profile = prev[targetUserId];
      if (!profile) return prev;

      const entryIndex = profile.history.findIndex(h => h.id === entryId);
      if (entryIndex === -1) return prev;

      const entry = profile.history[entryIndex];

      const updatedEntry = { ...entry, status: newStatus };
      const updatedHistory = [...profile.history];
      updatedHistory[entryIndex] = updatedEntry;

      let newPoints = profile.points;
      let newTotalKg = profile.totalKg;

      if (entry.status === 'pending' && newStatus === 'approved') {
        newPoints += (entry.points || 0);
        newTotalKg += (entry.kg || 0);
      } else if (entry.status === 'approved' && newStatus === 'rejected') {
        newPoints -= (entry.points || 0);
        newTotalKg -= (entry.kg || 0);
      }

      return {
        ...prev,
        [targetUserId]: {
          ...profile,
          points: newPoints,
          totalKg: newTotalKg,
          history: updatedHistory
        }
      };
    });
  }, []);

  // Admin: Adjust Points Manually
  const adjustUserPoints = useCallback((targetUserId: string, adjustment: number, reason: string) => {
    setUsersDb(prev => {
      const profile = prev[targetUserId];
      if (!profile) return prev;

      const newPoints = profile.points + adjustment;
      const newEntry: RewardHistoryEntry = {
        id: `admin-adj-${Date.now()}`,
        userId: targetUserId,
        type: 'admin_adjust',
        points: adjustment,
        note: reason,
        status: 'approved',
        createdAt: new Date().toISOString().slice(0, 10)
      };

      return {
        ...prev,
        [targetUserId]: {
          ...profile,
          points: newPoints,
          history: [newEntry, ...profile.history]
        }
      };
    });
  }, []);


  const updatePointsPerKg = useCallback((value: number) => {
    if (value <= 0) return;
    setConfig((prev) => ({ ...prev, pointsPerKg: value }));
  }, []);

  const addVoucher = useCallback((voucher: Omit<Voucher, 'id' | 'status'>) => {
    setAvailableVouchers((prev) => [
      { ...voucher, id: `voucher-${Date.now()}`, status: 'available' },
      ...prev,
    ]);
  }, []);

  const deleteVoucher = useCallback((id: string) => {
    setAvailableVouchers((prev) => prev.filter(v => v.id !== id));
  }, []);

  const editVoucher = useCallback((voucher: Voucher) => {
    setAvailableVouchers((prev) => prev.map(v => v.id === voucher.id ? voucher : v));
  }, []);

  // Admin API: Award Points directly
  const adminAwardPoints = useCallback(async (targetUserId: string, amountKg: number, manualPoints?: number, note?: string) => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        alert("Vui lòng đăng nhập quyền Admin.");
        return false;
      }

      let API_BASE = import.meta.env.VITE_API_URL;
      if (!API_BASE) {
        alert("Lỗi cấu hình: Thiếu API URL cơ sở.");
        return false;
      }

      // Clean URL to get base for admin endpoint
      // Ensure we remove /donate if it exists to get the root
      API_BASE = API_BASE.replace(/\/donate\/?$/, '');
      if (API_BASE.endsWith('/')) API_BASE = API_BASE.slice(0, -1);

      const response = await fetch(`${API_BASE}/admin/award-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          target_user_id: targetUserId,
          amount_kg: amountKg,
          manual_points: manualPoints,
          note: note
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Thành công! Đã cộng điểm cho user.`);
        // Optimistic update locally
        setUsersDb(prev => {
          const profile = prev[targetUserId];
          if (!profile) return prev;

          const pointsToAdd = manualPoints !== undefined ? manualPoints : (amountKg * 10);

          return {
            ...prev,
            [targetUserId]: {
              ...profile,
              points: profile.points + pointsToAdd,
              totalKg: profile.totalKg + amountKg,
              history: [{
                id: `admin-${Date.now()}`,
                userId: targetUserId,
                type: 'admin_adjust',
                points: pointsToAdd,
                kg: amountKg,
                note: note || 'Admin awarded points',
                status: 'approved',
                createdAt: new Date().toISOString().slice(0, 10)
              }, ...profile.history]
            }
          };
        });
        return true;
      } else {
        alert(`Lỗi: ${data.message || 'Thất bại'}`);
        return false;
      }

    } catch (e) {
      console.error(e);
      alert("Lỗi kết nối.");
      return false;
    }
  }, []);

  const refreshData = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setUsersDb(JSON.parse(stored));
  };

  const value = useMemo<RewardsState>(
    () => ({
      points,
      config,
      history,
      availableVouchers,
      claimedVouchers,
      allUsers: Object.values(usersDb),
      addDonation,
      redeemOption,
      updatePointsPerKg,
      addVoucher,
      deleteVoucher,
      editVoucher,
      updateDonationStatus,
      adjustUserPoints,
      adminAwardPoints,
      refreshData
    }),
    [
      points,
      config,
      history,
      availableVouchers,
      claimedVouchers,
      usersDb,
      addDonation,
      redeemOption,
      updatePointsPerKg,
      addVoucher,
      deleteVoucher,
      editVoucher,
      updateDonationStatus,
      adjustUserPoints,
      adminAwardPoints
    ],
  );

  return <RewardsContext.Provider value={value}>{children}</RewardsContext.Provider>;
}

export function useRewards() {
  const context = useContext(RewardsContext);
  if (!context) {
    throw new Error('useRewards must be used within RewardsProvider');
  }
  return context;
}
