export type Product = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  price: string;
  images: string[];
};

export const products: Product[] = [
  {
    id: 'product-1',
    slug: 'gach-xanh',
    name: 'Gạch Mosaic Xanh',
    summary: 'Tạo điểm nhấn độc đáo cho không gian sống với họa tiết màu sắc sinh động.',
    description:
      'Gạch Mosaic Xanh được sản xuất từ nhựa tái chế thân thiện với môi trường, độ bền cao, chống thấm tốt và phù hợp cho lát nền, ốp tường.',
    price: '160.000đ / viên',
    images: ['/EcobrichWeb/images/green-mosaic-tile.jpg', '/EcobrichWeb/images/banner.jpg'],
  },
  {
    id: 'product-2',
    slug: 'gach-vang',
    name: 'EcoTerrazzo Panel',
    summary: 'Giải pháp thẩm mỹ, thân thiện môi trường cho nội thất hiện đại.',
    description:
      'EcoTerrazzo Panel mang lại vẻ đẹp tự nhiên và tinh tế với hiệu ứng terrazzo độc đáo, phù hợp cho nhiều phong cách kiến trúc bền vững.',
    price: '180.000đ / viên',
    images: ['/EcobrichWeb/images/ecoterrazzo-panel.jpg', '/EcobrichWeb/images/hdpe.jpg'],
  },
  {
    id: 'product-3',
    slug: 'gach-do',
    name: 'Gạch lục giác Ecobrick Hexa',
    summary: 'Thiết kế tối ưu và bền vững cho lối đi công cộng và sân vườn.',
    description:
      'Gạch Hexa giúp tối ưu kết cấu lắp đặt, tăng độ bền và tính thẩm mỹ, phù hợp cho khu vực sinh hoạt ngoài trời và công trình xanh.',
    price: '140.000đ / viên',
    images: ['/EcobrichWeb/images/hdpe.jpg', '/EcobrichWeb/images/banner.jpg'],
  },
];
