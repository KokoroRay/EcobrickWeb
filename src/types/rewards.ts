export type RewardHistoryEntry = {
  id: string;
  type: 'donate' | 'redeem';
  kg?: number;
  points: number;
  note: string;
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
