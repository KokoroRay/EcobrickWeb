import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { confirmResetPassword, confirmSignUp, resendSignUpCode, resetPassword, signIn, signInWithRedirect } from 'aws-amplify/auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'confirm'>('request');
  const [resetMessage, setResetMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      await signIn({ username: normalizedEmail, password });
      navigate('/rewards');
    } catch (err) {
      const errorName = typeof err === 'object' && err !== null && 'name' in err
        ? String((err as { name?: string }).name)
        : '';
      if (errorName === 'UserNotConfirmedException') {
        setError('Tài khoản chưa được xác thực. Vui lòng nhập mã xác nhận đã gửi qua email.');
        setShowConfirm(true);
      } else if (errorName === 'NotAuthorizedException') {
        setError('Email hoặc mật khẩu không đúng. Nếu bạn vừa đăng ký, hãy kiểm tra email để xác nhận tài khoản.');
      } else {
        const message = err instanceof Error ? err.message : 'Đăng nhập thất bại.';
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const hasOauthConfig = Boolean(import.meta.env.VITE_COGNITO_DOMAIN);
    if (!hasOauthConfig) {
      setError('Chưa cấu hình đăng nhập Google trong Cognito.');
      return;
    }

    await signInWithRedirect({ provider: 'Google' });
  };

  const handleForgotPassword = async () => {
    setError('');
    setResetMessage('');
    const normalizedEmail = (resetEmail || email).trim().toLowerCase();
    if (!normalizedEmail) {
      setResetMessage('Vui lòng nhập email để khôi phục mật khẩu.');
      return;
    }

    try {
      await resetPassword({ username: normalizedEmail });
      setResetEmail(normalizedEmail);
      setResetStep('confirm');
      setResetMessage('Mã khôi phục đã được gửi tới email của bạn.');
      setShowReset(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể gửi mã khôi phục.';
      setResetMessage(message);
    }
  };

  const handleConfirmReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResetMessage('');
    const normalizedEmail = resetEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      setResetMessage('Email không hợp lệ.');
      return;
    }

    try {
      await confirmResetPassword({
        username: normalizedEmail,
        confirmationCode: resetCode.trim(),
        newPassword: resetNewPassword,
      });
      setResetMessage('Đổi mật khẩu thành công. Bạn có thể đăng nhập lại.');
      setShowReset(false);
      setResetStep('request');
      setResetCode('');
      setResetNewPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể đổi mật khẩu.';
      setResetMessage(message);
    }
  };

  const handleConfirmAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConfirmMessage('');
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setConfirmMessage('Vui lòng nhập email.');
      return;
    }

    try {
      await confirmSignUp({
        username: normalizedEmail,
        confirmationCode: confirmCode.trim(),
      });
      setConfirmMessage('Xác nhận thành công! Bạn có thể đăng nhập ngay.');
      setShowConfirm(false);
      setError('');
      window.setTimeout(() => {
        setConfirmMessage('');
        setConfirmCode('');
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Xác nhận thất bại.';
      setConfirmMessage(message);
    }
  };

  const handleResendConfirmCode = async () => {
    setConfirmMessage('');
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setConfirmMessage('Vui lòng nhập email.');
      return;
    }

    try {
      await resendSignUpCode({ username: normalizedEmail });
      setConfirmMessage('Mã xác nhận đã được gửi lại.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể gửi lại mã.';
      setConfirmMessage(message);
    }
  };

  return (
    <div className="page content">
      <section className="auth-section">
        <div className="container">
          <div className="login-container">
          <h2 className="login-title">Đăng nhập</h2>
          <p className="login-desc">Đăng nhập để theo dõi điểm thưởng và đổi ưu đãi</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <i className="fa-solid fa-envelope"></i>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="input-group">
              <i className="fa-solid fa-lock"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
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
                👁️
              </span>
            </div>
            {error ? <p className="auth-error">{error}</p> : null}
            <button className="btn-login" type="submit">
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
            <button
              className="forgot"
              type="button"
              onClick={() => {
                setResetMessage('');
                setResetStep('request');
                setShowReset((prev) => !prev);
              }}
            >
              Quên mật khẩu?
            </button>

            <button
              className="forgot"
              type="button"
              onClick={() => {
                setConfirmMessage('');
                setShowConfirm((prev) => !prev);
              }}
              style={{ marginTop: '0.5rem' }}
            >
              Chưa xác nhận tài khoản?
            </button>

            {showReset ? (
              <div className="auth-reset">
                <p className="auth-reset-title">Khôi phục mật khẩu</p>
                {resetStep === 'request' ? (
                  <div className="auth-reset-body">
                    <div className="input-group">
                      <i className="fa-solid fa-envelope"></i>
                      <input
                        type="email"
                        placeholder="Email"
                        value={resetEmail}
                        onChange={(event) => setResetEmail(event.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>
                    {resetMessage ? <p className="auth-helper">{resetMessage}</p> : null}
                    <button className="btn-login" type="button" onClick={handleForgotPassword}>
                      Gửi mã khôi phục
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleConfirmReset} className="auth-reset-body">
                    <div className="input-group">
                      <i className="fa-solid fa-key"></i>
                      <input
                        type="text"
                        placeholder="Mã xác nhận"
                        value={resetCode}
                        onChange={(event) => setResetCode(event.target.value)}
                        autoComplete="one-time-code"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <i className="fa-solid fa-lock"></i>
                      <input
                        type="password"
                        placeholder="Mật khẩu mới"
                        value={resetNewPassword}
                        onChange={(event) => setResetNewPassword(event.target.value)}
                        autoComplete="new-password"
                        required
                      />
                    </div>
                    {resetMessage ? <p className="auth-helper">{resetMessage}</p> : null}
                    <button className="btn-login" type="submit">
                      Xác nhận đổi mật khẩu
                    </button>
                    <button
                      className="btn-signup secondary"
                      type="button"
                      onClick={() => setResetStep('request')}
                    >
                      Quay lại
                    </button>
                  </form>
                )}
              </div>
            ) : null}

            {showConfirm ? (
              <div className="auth-reset">
                <p className="auth-reset-title">Xác nhận tài khoản</p>
                <form onSubmit={handleConfirmAccount} className="auth-reset-body">
                  <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#666' }}>
                    Nhập mã xác nhận đã được gửi đến email <strong>{email}</strong>
                  </p>
                  <div className="input-group">
                    <i className="fa-solid fa-key"></i>
                    <input
                      type="text"
                      placeholder="Mã xác nhận (6 số)"
                      value={confirmCode}
                      onChange={(event) => setConfirmCode(event.target.value)}
                      autoComplete="one-time-code"
                      maxLength={6}
                      required
                    />
                  </div>
                  {confirmMessage ? <p className="auth-helper">{confirmMessage}</p> : null}
                  <button className="btn-login" type="submit">
                    Xác nhận tài khoản
                  </button>
                  <button
                    className="btn-signup secondary"
                    type="button"
                    onClick={handleResendConfirmCode}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Gửi lại mã xác nhận
                  </button>
                  <button
                    className="btn-signup secondary"
                    type="button"
                    onClick={() => {
                      setShowConfirm(false);
                      setConfirmCode('');
                      setConfirmMessage('');
                    }}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Đóng
                  </button>
                </form>
              </div>
            ) : null}

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
