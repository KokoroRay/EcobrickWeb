import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
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
  addDonation: (kg: number, note?: string) => void;
  redeemOption: (option: RedeemOption) => { success: boolean; message: string };
  updatePointsPerKg: (value: number) => void;
  addVoucher: (voucher: Omit<Voucher, 'id' | 'status'>) => void;

  // Admin Actions
  updateDonationStatus: (userId: string, entryId: string, status: 'approved' | 'rejected') => void;
  adjustUserPoints: (userId: string, points: number, reason: string) => void;
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
    (kg: number, note = 'Quyên góp nhựa tại điểm thu gom') => {
      if (!isAuthenticated || !currentUserId) return;

      const earned = kg * config.pointsPerKg;
      const newEntry: RewardHistoryEntry = {
        id: `history-${Date.now()}`,
        userId: currentUserId,
        type: 'donate',
        kg,
        points: earned, // Points to be added upon approval
        note,
        status: 'pending', // IMPORTANT: Pending by default
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
            // totalKg and points do NOT increase yet
          }
        };
      });
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
      if (entry.status !== 'pending') return prev; // Validated status change only from pending

      const updatedEntry = { ...entry, status: newStatus };
      const updatedHistory = [...profile.history];
      updatedHistory[entryIndex] = updatedEntry;

      let newPoints = profile.points;
      let newTotalKg = profile.totalKg;

      if (newStatus === 'approved') {
        newPoints += (entry.points || 0);
        newTotalKg += (entry.kg || 0);
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

  const refreshData = () => {
    // Re-read from local storage if needed, mainly for cross-tab, but simple strict mode reload handles it usually.
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
      updateDonationStatus,
      adjustUserPoints,
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
      updateDonationStatus,
      adjustUserPoints
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
