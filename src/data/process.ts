export type ProcessStep = {
  id: string;
  title: string;
  description: string;
  image: string;
};

export const processSteps: ProcessStep[] = [
  {
    id: 'step-1',
    title: 'Thu gom nhựa',
    description:
      'Nhựa phế thải được thu gom từ hộ gia đình, khu dân cư và nhà máy để đảm bảo nguồn nguyên liệu ổn định.',
    image: '/images/Banner.jpg',
  },
  {
    id: 'step-2',
    title: 'Phân loại & xử lý',
    description:
      'Nhựa được phân loại, làm sạch và loại bỏ tạp chất nhằm đảm bảo chất lượng cao cho sản phẩm cuối cùng.',
    image: '/images/HDPE.jpg',
  },
  {
    id: 'step-3',
    title: 'Ép thành nhựa',
    description:
      'Nhựa sạch được nung chảy và ép thành các khối vật liệu bền chắc, sẵn sàng tạo hình.',
    image: '/images/EcoTerrazzo%20Panel.jpg',
  },
  {
    id: 'step-4',
    title: 'Hoàn thiện & lắp đặt',
    description:
      'Gia công bề mặt, kiểm định chất lượng và lắp đặt gạch cho các công trình xanh.',
    image: '/images/Gạch%20Mosaic%20Xanh.jpg',
  },
];
