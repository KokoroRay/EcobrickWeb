import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signIn, signInWithRedirect, fetchAuthSession } from 'aws-amplify/auth';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;
  const { checkAuth } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      setIsSubmitting(false);
      return;
    }

    try {
      await signIn({ username: normalizedEmail, password });
      await checkAuth(); // Update auth state

      // Check role to redirect
      const session = await fetchAuthSession();
      const groups = (session.tokens?.idToken?.payload['cognito:groups'] || session.tokens?.accessToken?.payload['cognito:groups'] || []) as string[];

      if (groups.includes('admin')) {
        showToast('Xin chào Admin! Đang chuyển hướng...', 'success');
        navigate('/admin');
      } else {
        showToast('Đăng nhập thành công! Chào mừng bạn quay trở lại.', 'success');
        navigate('/rewards');
      }
    } catch (err) {
      console.error('Login error:', err);

      // Parse error từ AWS Cognito
      const errorName = typeof err === 'object' && err !== null && 'name' in err
        ? String((err as { name?: string }).name)
        : '';

      if (errorName === 'UserNotConfirmedException') {
        setError('❌ Tài khoản chưa được xác thực. Vui lòng kiểm tra email và nhập mã xác nhận để kích hoạt tài khoản.');
        // Redirect to register page to confirm
        setTimeout(() => {
          navigate('/register?email=' + encodeURIComponent(normalizedEmail));
        }, 3000);
      } else if (errorName === 'NotAuthorizedException') {
        setError('❌ Sai mật khẩu. Vui lòng kiểm tra lại hoặc dùng chức năng "Quên mật khẩu".');
      } else if (errorName === 'UserNotFoundException') {
        setError('❌ Email này chưa được đăng ký. Vui lòng tạo tài khoản mới.');
      } else if (errorName === 'InvalidParameterException') {
        setError('❌ Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra email và mật khẩu.');
      } else if (errorName === 'TooManyRequestsException' || errorName === 'LimitExceededException') {
        setError('❌ Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi 15 phút và thử lại.');
      } else {
        const message = err instanceof Error ? err.message : 'Đăng nhập thất bại.';
        setError(`❌ Lỗi: ${message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const hasOauthConfig = Boolean(import.meta.env.VITE_COGNITO_DOMAIN);
    if (!hasOauthConfig) {
      setError('❌ Chưa cấu hình đăng nhập Google trong Cognito.');
      return;
    }

    try {
      await signInWithRedirect({ provider: 'Google' });
    } catch (err) {
      setError('❌ Không thể đăng nhập với Google. Vui lòng thử lại.');
    }
  };

  return (
    <div className="page content">
      <section className="auth-section">
        <div className="container">
          <div className="login-container">
            <h2 className="login-title">Đăng nhập</h2>
            <p className="login-desc">Đăng nhập để theo dõi điểm thưởng và đổi ưu đãi</p>

            {successMessage && (
              <div style={{
                padding: '1rem',
                background: '#d4edda',
                color: '#155724',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid #c3e6cb'
              }}>
                ✅ {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label className="form-label">Email</label>
              <div className="input-group">
                <i className="fa-solid fa-envelope"></i>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <label className="form-label">Mật khẩu</label>
              <div className="input-group">
                <i className="fa-solid fa-lock"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
                <span
                  className="show-pass"
                  role="button"
                  tabIndex={0}
                  onClick={() => setShowPassword((prev) => !prev)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      setShowPassword((prev) => !prev);
                    }
                  }}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>

              {error && (
                <p className="auth-error" style={{
                  padding: '0.75rem',
                  background: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #f5c6cb'
                }}>
                  {error}
                </p>
              )}

              <button className="btn-login" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link to="/forgot-password" className="forgot">
                  Quên mật khẩu?
                </Link>
              </div>

              <div className="divider">
                <span>hoặc</span>
              </div>

              <button className="btn-google google-btn" type="button" onClick={handleGoogleLogin}>
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
    </div>
  );
}
