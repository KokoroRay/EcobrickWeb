import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="page content">
      <section className="auth-section">
        <div className="container">
          <div className="signup-page">
        <div className="signup-container">
          <h2 className="signup-title">Tạo tài khoản</h2>
          <p className="signup-note">Đăng ký nhanh để nhận điểm thưởng</p>
          <p className="signup-desc">
            Thông tin của bạn sẽ được dùng để tích điểm từ nhựa và đổi ưu đãi khi mua gạch Ecobrick.
          </p>

          <form onSubmit={(event) => event.preventDefault()}>
            <label className="form-label">Họ và tên</label>
            <div className="input-group">
              <i className="fa-solid fa-user"></i>
              <input type="text" placeholder="Nguyễn Văn A" />
            </div>

            <label className="form-label">Email</label>
            <div className="input-group">
              <i className="fa-solid fa-envelope"></i>
              <input type="email" placeholder="email@ecobrick.example" />
            </div>

            <label className="form-label">Mật khẩu</label>
            <div className="input-group">
              <i className="fa-solid fa-lock"></i>
              <input type="password" placeholder="********" />
              <span className="show-pass">👁️</span>
            </div>
            <p className="password-hint">Tối thiểu 8 ký tự, gồm chữ hoa và số.</p>

            <label className="form-label">Ngày sinh</label>
            <div className="date-group">
              <select>
                <option>Ngày</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
              </select>
              <select>
                <option>Tháng</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
              </select>
              <select>
                <option>Năm</option>
                <option>1999</option>
                <option>2000</option>
                <option>2001</option>
              </select>
            </div>

            <label className="form-label">Số điện thoại</label>
            <div className="phone-group">
              <select>
                <option>+84</option>
                <option>+1</option>
                <option>+81</option>
              </select>
              <input type="text" placeholder="0909 123 456" />
            </div>

            <div className="checkbox-group">
              <input type="checkbox" id="policy" />
              <label htmlFor="policy">
                Tôi đồng ý với các điều khoản và chính sách bảo mật của Ecobrick.
              </label>
            </div>

            <button className="btn-signup" type="submit">
              Tạo tài khoản
            </button>

            <div className="divider">
              <span>hoặc</span>
            </div>

            <button className="btn-google google-btn" type="button">
              <i className="fab fa-google"></i>
              Đăng ký với Google
            </button>

            <div className="signup-section">
              <p className="signup-desc">Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
            </div>
          </form>
          </div>
        </div>
      </section>
    </div>
  );
}
