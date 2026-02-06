export type RewardHistoryEntry = {
  id: string;
  userId?: string; // Optional for backward compatibility, but should be used
  type: 'donate' | 'redeem' | 'admin_adjust';
  kg?: number;
  points: number;
  note: string;
  status?: 'pending' | 'approved' | 'rejected'; // For donation orders
  createdAt: string;
};

export type Voucher = {
  id: string;
  title: string;
  code: string;
  discount: string;
  pointsRequired: number;
  expiresAt: string;
  status: 'available' | 'claimed' | 'used';
};

export type RedeemOption = {
  id: string;
  title: string;
  pointsRequired: number;
  benefit: string;
  description: string;
};

export type RewardsConfig = {
  pointsPerKg: number;
  tiers: RedeemOption[];
};

export type UserRewardProfile = {
  id: string;
  name: string;
  email: string;
  points: number;
  totalKg: number;
  history: RewardHistoryEntry[];
  claimedVouchers: Voucher[];
};
