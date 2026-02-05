import { Link } from 'react-router-dom';
import { products } from '../data/products';

export default function Home() {
  return (
    <section className="page content">
      <section className="hero">
        <div className="hero-left">
          <h1>
            GẠCH TÁI CHẾ <span className="highlight">ECOBRICK</span>
          </h1>
          <h2>Dự án thử nghiệm sản xuất gạch từ nhựa tái chế</h2>
          <p className="lead">
            Chúng tôi tận dụng rác thải nhựa, tái chế thành vật liệu xây dựng bền – đẹp – thân thiện với môi trường.
          </p>
          <div className="hero-cta">
            <Link to="/products" className="btn primary">
              Khám phá sản phẩm →
            </Link>
          </div>
        </div>
        <div className="hero-right">
          <img src="/images/Banner.jpg" alt="Gạch lát từ rác nhựa" />
        </div>
      </section>

      <section className="section pad">
        <h2 className="section-title">ECOBRICK CÓ GÌ?</h2>
        <p className="section-sub">Những mẫu gạch tái chế nổi bật của chúng tôi</p>

        <div className="product-list">
          {products.map((product) => (
            <article className="card product-card" key={product.id}>
              <img src={product.images[0]} alt={product.name} />
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

        <div className="center">
          <Link className="link" to="/products" id="view-all">
            Xem tất cả sản phẩm
          </Link>
        </div>
      </section>

      <section className="section pad">
        <h2 className="section-title">QUY TRÌNH SẢN XUẤT</h2>
        <div className="process-grid">
          <div className="process-card" style={{ background: '#1565C0' }}>
            <div className="icon">🗑️</div>
            <h3>Thu gom nhựa</h3>
            <p>Thu thập rác thải nhựa từ hộ gia đình, khu dân cư và nhà máy để tái chế</p>
          </div>
          <div className="process-card" style={{ background: '#00796B' }}>
            <div className="icon">🔍</div>
            <h3>Phân loại – Xử lý</h3>
            <p>Phân loại, làm sạch và xử lý nhựa nhằm đảm bảo chất lượng vật liệu đầu vào.</p>
          </div>
          <div className="process-card" style={{ background: '#FBC02D' }}>
            <div className="icon">🧊</div>
            <h3>Ép thành nhựa</h3>
            <p>Nung chảy và ép thành các khối nhựa có độ bền cao, sẵn sàng tạo hình.</p>
          </div>
          <div className="process-card" style={{ background: '#4DB6AC' }}>
            <div className="icon">🛣️</div>
            <h3>Lát đường</h3>
            <p>Gia công, hoàn thiện bề mặt và lắp đặt làm gạch lát cho công trình xanh.</p>
          </div>
        </div>
      </section>

      <section className="section pad section-light">
        <h2 className="section-title">TÁC ĐỘNG & LỢI ÍCH</h2>
        <p className="section-sub">Giảm rác thải nhựa, tạo việc làm và nâng cao cảnh quan đô thị</p>

        <div className="impact-cards">
          <div className="impact-card">
            <div className="icon">♻️</div>
            <h4>Giảm ô nhiễm</h4>
            <p>Giảm lượng nhựa ra môi trường, góp phần vệ sinh đô thị.</p>
          </div>
          <div className="impact-card">
            <div className="icon">🏗️</div>
            <h4>Bền & Tiết kiệm</h4>
            <p>Sản phẩm độ bền cao, ít bảo trì hơn vật liệu truyền thống.</p>
          </div>
          <div className="impact-card">
            <div className="icon">🤝</div>
            <h4>Tạo việc làm</h4>
            <p>Tạo chuỗi giá trị và cơ hội việc làm cho cộng đồng.</p>
          </div>
        </div>
      </section>
    </section>
  );
}
