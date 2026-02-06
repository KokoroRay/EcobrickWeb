import { useEffect } from 'react';
import { getAssetPath } from '../utils/assets';

export default function About() {
  useEffect(() => {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.slide-left, .slide-right, .fade-in');
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="page content">
      {/* GIỚI THIỆU */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-text slide-left">
            <h2 className="section-title left">GIỚI THIỆU</h2>
            <p>
              <em>
                <strong>Ecobrick</strong> - Dự án Gạch tái chế từ rác nhựa mềm
              </em>
            </p>
            <p>
              <strong>Ecobrick</strong> là sáng kiến hướng tới giảm ô nhiễm nhựa bằng cách tận dụng các loại nhựa mềm khó tái chế
              (chai nhựa mỏng, túi nilon, màng bọc) đưa vào thành phần sản xuất gạch xây dựng. Mỗi viên gạch được thiết kế chứa
              khoảng 1% nhựa tái chế (≈130 g đối với viên 13 kg), bảo đảm vừa xử lý được một phần rác thải nhựa, vừa duy trì độ bền
              cơ học của sản phẩm. Dự án đồng thời theo đuổi mục tiêu kinh tế tuần hoàn và phù hợp xu hướng vật liệu xanh trong lộ
              trình Net Zero 2050.
            </p>
          </div>
          <div className="about-image slide-right">
            <img src={getAssetPath('images/banner.jpg')} alt="Ecobrick giới thiệu" loading="lazy" />
          </div>
        </div>
      </section>

      {/* TẦM NHÌN */}
      <section className="vision-section section-light">
        <div className="vision-container">
          <div className="vision-image slide-left">
            <img src={getAssetPath('images/ecoterrazzo-panel.jpg')} alt="Tầm nhìn Ecobrick" loading="lazy" />
          </div>
          <div className="vision-text slide-right">
            <h2 className="section-title left">TẦM NHÌN</h2>
            <p>
              Trở thành doanh nghiệp tiên phong trong lĩnh vực vật liệu xây dựng xanh tại Việt Nam, góp phần giảm thiểu ô nhiễm nhựa
              và thúc đẩy lối sống bền vững.
            </p>
            <p>
              Mục tiêu của Ecobrick không chỉ là tạo ra một loại gạch thân thiện với môi trường mà còn nâng cao nhận thức của cộng
              đồng về khả năng tái chế rác thải – biến những thứ tưởng chừng vô giá trị thành nền tảng cho những công trình vững chắc
              và nhân văn.
            </p>
          </div>
        </div>
      </section>

      {/* SỨ MỆNH */}
      <section className="mission-section">
        <div className="mission-container">
          <div className="mission-text slide-left">
            <h2 className="section-title left">SỨ MỆNH</h2>
            <p>
              Cung cấp các giải pháp xây dựng bền vững, thân thiện với môi trường và tiết kiệm chi phí bằng cách biến rác thải nhựa
              mềm thành vật liệu hữu ích cho cuộc sống con người.
            </p>
            <p>
              Dự án hướng đến việc tạo ra sản phẩm gạch có độ bền cao, giá thành hợp lý, đồng thời giảm lượng rác thải nhựa trong tự
              nhiên. Bên cạnh đó, nhóm đề cao giáo dục cộng đồng, khuyến khích người dân và doanh nghiệp cùng tham gia vào chuỗi tái
              chế.
            </p>
          </div>
          <div className="mission-image slide-right">
            <img src={getAssetPath('images/hdpe.jpg')} alt="Sứ mệnh Ecobrick" loading="lazy" />
          </div>
        </div>
      </section>
    </div>
  );
}
