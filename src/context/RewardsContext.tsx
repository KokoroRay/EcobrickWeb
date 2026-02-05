import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { RedeemOption, RewardHistoryEntry, RewardsConfig, Voucher } from '../types/rewards';
import { defaultRedeemOptions, initialVouchers } from '../data/rewards';

const initialHistory: RewardHistoryEntry[] = [
  {
    id: 'history-1',
    type: 'donate',
    kg: 8,
    points: 80,
    note: 'Quyên góp nhựa tại điểm thu gom Cần Thơ',
    createdAt: '2026-01-20',
  },
  {
    id: 'history-2',
    type: 'redeem',
    points: -100,
    note: 'Đổi voucher giảm 5%',
    createdAt: '2026-01-28',
  },
];

type RewardsState = {
  points: number;
  config: RewardsConfig;
  history: RewardHistoryEntry[];
  availableVouchers: Voucher[];
  claimedVouchers: Voucher[];
  addDonation: (kg: number, note?: string) => void;
  redeemOption: (option: RedeemOption) => { success: boolean; message: string };
  updatePointsPerKg: (value: number) => void;
  addVoucher: (voucher: Omit<Voucher, 'id' | 'status'>) => void;
};

const RewardsContext = createContext<RewardsState | undefined>(undefined);

const createVoucherCode = (prefix: string) => {
  const stamp = Date.now().toString().slice(-5);
  return `${prefix}-${stamp}`.toUpperCase();
};

export function RewardsProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useState(420);
  const [history, setHistory] = useState<RewardHistoryEntry[]>(initialHistory);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>(initialVouchers);
  const [claimedVouchers, setClaimedVouchers] = useState<Voucher[]>([]);
  const [config, setConfig] = useState<RewardsConfig>({
    pointsPerKg: 10,
    tiers: defaultRedeemOptions,
  });

  const addDonation = useCallback(
    (kg: number, note = 'Quyên góp nhựa tại điểm thu gom') => {
      if (kg <= 0) return;
      const earned = kg * config.pointsPerKg;
      setPoints((prev) => prev + earned);
      setHistory((prev) => [
        {
          id: `history-${Date.now()}`,
          type: 'donate',
          kg,
          points: earned,
          note,
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
    },
    [config.pointsPerKg],
  );

  const redeemOption = useCallback(
    (option: RedeemOption) => {
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

      setPoints((prev) => prev - option.pointsRequired);
      setClaimedVouchers((prev) => [voucher, ...prev]);
      setHistory((prev) => [
        {
          id: `history-${Date.now()}-redeem`,
          type: 'redeem',
          points: -option.pointsRequired,
          note: `Đổi ${option.title}`,
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);

      return { success: true, message: 'Đổi điểm thành công! Voucher đã được thêm vào tài khoản.' };
    },
    [points],
  );

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

  const value = useMemo<RewardsState>(
    () => ({
      points,
      config,
      history,
      availableVouchers,
      claimedVouchers,
      addDonation,
      redeemOption,
      updatePointsPerKg,
      addVoucher,
    }),
    [
      points,
      config,
      history,
      availableVouchers,
      claimedVouchers,
      addDonation,
      redeemOption,
      updatePointsPerKg,
      addVoucher,
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
