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
      'Nhựa phế thải được thu gom từ các nguồn sinh hoạt, công nghiệp và khu dân cư, đảm bảo nguồn nguyên liệu sạch và bền vững cho quá trình sản xuất.',
    image: '/EcobrickWeb/images/banner.jpg',
  },
  {
    id: 'step-2',
    title: 'Phân loại & xử lý',
    description:
      'Sử dụng công nghệ hiện đại để phân loại và làm sạch nhựa, loại bỏ tạp chất nhằm đảm bảo chất lượng cao cho sản phẩm cuối cùng.',
    image: '/EcobrickWeb/images/hdpe.jpg',
  },
  {
    id: 'step-3',
    title: 'Nghiền nhựa',
    description:
      'Nhựa sạch được nghiền thành hạt nhỏ hoặc mảnh vụn, giúp dễ dàng trộn đều trong hỗn hợp vật liệu xây dựng với độ đồng đều cao.',
    image: '/EcobrickWeb/images/ecoterrazzo-panel.jpg',
  },
  {
    id: 'step-4',
    title: 'Phối trộn',
    description:
      'Nhựa nghiền được phối trộn với hỗn hợp vật liệu vô cơ gồm xi măng, cát, đá theo tỉ lệ khoa học, đảm bảo tính liên kết và độ bền tối ưu.',
    image: '/EcobrickWeb/images/green-mosaic-tile.jpg',
  },
  {
    id: 'step-5',
    title: 'Định hình',
    description:
      'Hỗn hợp sau khi trộn được đổ vào khuôn và định hình trên cơ chế rung với tần suất cao, tạo hình dạng viên gạch chuẩn xác và chất lượng đồng nhất.',
    image: '/EcobrickWeb/images/green-mosaic-tile.jpg',
  },
];
