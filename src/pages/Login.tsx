import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <section className="page content">
      <div className="login-page">
        <div className="login-container">
          <h2 className="login-title">Đăng nhập</h2>
          <p className="login-desc">Đăng nhập để theo dõi điểm thưởng và đổi ưu đãi</p>

          <form onSubmit={(event) => event.preventDefault()}>
            <div className="input-group">
              <i className="fa-solid fa-envelope"></i>
              <input type="email" placeholder="Email" />
            </div>
            <div className="input-group">
              <i className="fa-solid fa-lock"></i>
              <input type="password" placeholder="Mật khẩu" />
              <span className="show-pass">👁️</span>
            </div>
            <button className="btn-login" type="submit">
              Đăng nhập
            </button>
            <a className="forgot" href="#">
              Quên mật khẩu?
            </a>

            <div className="divider">
              <span>hoặc</span>
            </div>

            <button className="btn-google google-btn" type="button">
              <i className="fab fa-google"></i>
              Đăng nhập với Google
            </button>
          </form>

          <div className="signup-section">
            <p className="signup-title">Chưa có tài khoản?</p>
            <p className="signup-desc">Tạo tài khoản để bắt đầu tích điểm đổi ưu đãi.</p>
            <Link to="/register" className="btn-signup secondary">
              Tạo tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
