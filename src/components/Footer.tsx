import { getAssetPath } from '../utils/assets';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-about">
          <img
            src={getAssetPath('LogoEBwhile.png')}
            alt="Ecobrick Logo"
            className="footer-logo"
          />
        </div>

        <div className="footer-links">
          <h4>Liên kết nhanh</h4>
          <ul>
            <li><a href="/">Trang chủ</a></li>
            <li><a href="/about">Giới thiệu</a></li>
            <li><a href="/products">Sản phẩm</a></li>
            <li><a href="/process">Quy trình sản xuất</a></li>
            <li><a href="/contact">Liên hệ</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Liên hệ</h4>
          <p>📍 Nguyễn Văn Cừ, Ninh Kiều, TP Cần Thơ</p>
          <p>📞 0909 123 456</p>
          <p>📧 ecobrick.vn@gmail.com</p>
          <p>🕒 8:00 - 17:00 (T2 - T7)</p>
        </div>

        <div className="footer-social">
          <h4>Kết nối với chúng tôi</h4>
          <div className="social-icons">
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="TikTok"><i className="fab fa-tiktok"></i></a>
            <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Ecobrick. All rights reserved. Thiết kế và phát triển bởi Ecobrick Team.</p>
      </div>
    </footer>
  );
}
