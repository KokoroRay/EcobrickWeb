import { Link } from 'react-router-dom';
import { getAssetPath } from '../utils/assets';
import { useEffect } from 'react';
import { products } from '../data/products';

export default function Home() {
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

    const animatedElements = document.querySelectorAll('.fade-in, .product-card, .process-card, .impact-card');
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="page content">
      <section className="hero hero-banner" style={{
        backgroundImage: `url(${getAssetPath('images/background.jpg')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative'
      }}>
        <div className="hero-overlay"></div>
        <div className="hero-left">
          <h1 className="animate-slide-up">
            GẠCH TÁI CHẾ <span className="highlight">ECOBRICK</span>
          </h1>
          <h2 className="animate-slide-up delay-100">Dự án thử nghiệm sản xuất gạch từ nhựa tái chế</h2>
          <p className="lead animate-slide-up delay-200">
            Chúng tôi tận dụng rác thải nhựa, tái chế thành vật liệu xây dựng bền – đẹp – thân thiện với môi trường.
          </p>
          <div className="hero-cta animate-slide-up delay-300">
            <Link to="/products" className="btn primary">
              Khám phá sản phẩm →
            </Link>
          </div>
        </div>
      </section>

      <section className="section pad">
        <div className="container">
          <h2 className="section-title">ECOBRICK CÓ GÌ?</h2>
          <p className="section-sub">Những mẫu gạch tái chế nổi bật của chúng tôi</p>

          <div className="product-list">
            {products.map((product, index) => (
              <article className="card product-card fade-in" key={product.id} style={{ transitionDelay: `${index * 0.1}s` }}>
                <img src={getAssetPath(product.images[0])} alt={product.name} loading="lazy" />
                <div className="card-body">
                  <h3>{product.name}</h3>
                  <p>{product.summary}</p>
                  <Link to={`/products/${product.slug}`} className="chip">
                    Xem chi tiết
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="center" style={{ marginTop: '2rem' }}>
            <Link id="view-all" to="/products">
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </section>

      <section className="section pad">
        <div className="container">
          <h2 className="section-title">QUY TRÌNH SẢN XUẤT</h2>
          <p className="section-sub">Hành trình tái chế xanh từ rác thải đến vật liệu xây dựng</p>
          <div className="process-grid">
            <div className="process-card fade-in" style={{ background: '#1565C0', transitionDelay: '0s' }}>
              <div className="icon">🗑️</div>
              <h3>Thu gom nhựa</h3>
              <p>Thu thập rác thải nhựa từ hộ gia đình, khu dân cư và nhà máy để tái chế</p>
            </div>
            <div className="process-card fade-in" style={{ background: '#00796B', transitionDelay: '0.1s' }}>
              <div className="icon">🔍</div>
              <h3>Phân loại – Xử lý</h3>
              <p>Phân loại, làm sạch và xử lý nhựa nhằm đảm bảo chất lượng vật liệu đầu vào</p>
            </div>
            <div className="process-card fade-in" style={{ background: '#FBC02D', transitionDelay: '0.2s' }}>
              <div className="icon">🧊</div>
              <h3>Ép thành nhựa</h3>
              <p>Nung chảy và ép thành các khối nhựa có độ bền cao, sẵn sàng tạo hình</p>
            </div>
            <div className="process-card fade-in" style={{ background: '#4DB6AC', transitionDelay: '0.3s' }}>
              <div className="icon">🛣️</div>
              <h3>Lát đường</h3>
              <p>Gia công, hoàn thiện bề mặt và lắp đặt làm gạch lát cho công trình xanh</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section pad section-light">
        <div className="container">
          <h2 className="section-title">TÁC ĐỘNG & LỢI ÍCH</h2>
          <p className="section-sub">Giảm rác thải nhựa, tạo việc làm và nâng cao cảnh quan đô thị</p>

          <div className="impact-cards">
            <div className="impact-card fade-in" style={{ transitionDelay: '0s' }}>
              <div className="icon">♻️</div>
              <h4>Giảm ô nhiễm</h4>
              <p>Giảm lượng nhựa ra môi trường, góp phần vệ sinh đô thị</p>
            </div>
            <div className="impact-card fade-in" style={{ transitionDelay: '0.1s' }}>
              <div className="icon">🏗️</div>
              <h4>Bền & Tiết kiệm</h4>
              <p>Sản phẩm độ bền cao, ít bảo trì hơn vật liệu truyền thống</p>
            </div>
            <div className="impact-card fade-in" style={{ transitionDelay: '0.2s' }}>
              <div className="icon">🤝</div>
              <h4>Tạo việc làm</h4>
              <p>Tạo chuỗi giá trị và cơ hội việc làm cho cộng đồng</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
