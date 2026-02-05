import type { RedeemOption, Voucher } from '../types/rewards';

export const defaultRedeemOptions: RedeemOption[] = [
  {
    id: 'tier-100',
    title: 'Voucher giảm 5%',
    pointsRequired: 100,
    benefit: 'Giảm 5% khi mua gạch',
    description: 'Áp dụng cho đơn hàng mua gạch tại hệ thống Ecobrick và đối tác.',
  },
  {
    id: 'tier-300',
    title: 'Voucher giảm 10%',
    pointsRequired: 300,
    benefit: 'Giảm 10% khi mua gạch',
    description: 'Dành cho khách hàng thân thiết và các đơn hàng từ 10 viên trở lên.',
  },
  {
    id: 'tier-500',
    title: 'Voucher giảm 15%',
    pointsRequired: 500,
    benefit: 'Giảm 15% khi mua gạch',
    description: 'Ưu đãi cao nhất cho các dự án xanh và công trình cộng đồng.',
  },
  {
    id: 'tier-1000',
    title: 'Ưu đãi đặc biệt',
    pointsRequired: 1000,
    benefit: 'Giá mua gạch ưu đãi đặc biệt',
    description: 'Liên hệ đội ngũ Ecobrick để nhận báo giá riêng và quyền lợi mở rộng.',
  },
];

export const initialVouchers: Voucher[] = [
  {
    id: 'voucher-1',
    title: 'Voucher 5% cho đơn hàng mới',
    code: 'ECO5-NEW',
    discount: '5%',
    pointsRequired: 100,
    expiresAt: '2026-06-30',
    status: 'available',
  },
  {
    id: 'voucher-2',
    title: 'Voucher 10% cho gạch Mosaic',
    code: 'ECO10-MOSAIC',
    discount: '10%',
    pointsRequired: 300,
    expiresAt: '2026-09-30',
    status: 'available',
  },
];
