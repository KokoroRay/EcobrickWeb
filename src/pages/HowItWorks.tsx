import { Link } from 'react-router-dom';

export default function HowItWorks() {
  return (
    <section className="page content">
      <div className="section pad">
        <h2 className="section-title">CÁCH THỨC HOẠT ĐỘNG</h2>
        <p className="section-sub">
          Hệ thống tích điểm đổi ưu đãi giúp khuyến khích thu gom nhựa và xây dựng cộng đồng xanh.
        </p>

        <div className="rewards-actions">
          <div className="rewards-panel">
            <h2>1. Đăng ký / Đăng nhập</h2>
            <p>
              Người dùng tạo tài khoản để lưu điểm thưởng, lịch sử tích điểm và các voucher đã đổi.
            </p>
            <Link to="/register" className="btn primary">
              Tạo tài khoản
            </Link>
          </div>
          <div className="rewards-panel">
            <h2>2. Quyên góp nhựa</h2>
            <p>
              Nhựa được tính theo kg. Với cơ chế hiện tại: 1 kg nhựa = 10 điểm.
            </p>
            <Link to="/rewards" className="btn outline">
              Gửi thông tin quyên góp
            </Link>
          </div>
          <div className="rewards-panel">
            <h2>3. Đổi điểm lấy ưu đãi</h2>
            <p>
              Từ 100 điểm bạn đã có thể đổi voucher giảm giá. Các mốc điểm có thể điều chỉnh linh hoạt bởi admin.
            </p>
            <Link to="/redeem" className="btn outline">
              Xem mốc đổi điểm
            </Link>
          </div>
        </div>

        <div className="section pad">
          <h3 className="section-title">Lộ trình tích điểm</h3>
          <div className="voucher-grid">
            <div className="voucher-card">
              <span className="badge">100 điểm</span>
              <h3>Voucher giảm 5%</h3>
              <p>Áp dụng khi mua gạch tại hệ thống Ecobrick hoặc cửa hàng liên kết.</p>
            </div>
            <div className="voucher-card">
              <span className="badge">300 điểm</span>
              <h3>Voucher giảm 10%</h3>
              <p>Ưu đãi phù hợp cho khách hàng mua số lượng vừa và dự án nhỏ.</p>
            </div>
            <div className="voucher-card">
              <span className="badge">500 điểm</span>
              <h3>Voucher giảm 15%</h3>
              <p>Áp dụng cho đơn hàng lớn, giúp tiết kiệm đáng kể chi phí vật liệu.</p>
            </div>
            <div className="voucher-card">
              <span className="badge">1.000 điểm</span>
              <h3>Ưu đãi đặc biệt</h3>
              <p>Liên hệ Ecobrick để nhận báo giá riêng cho dự án xanh.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
