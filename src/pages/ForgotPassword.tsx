import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { confirmResetPassword, resetPassword } from 'aws-amplify/auth';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  
  const [step, setStep] = useState<'request' | 'confirm'>(emailParam ? 'confirm' : 'request');
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Vui lòng nhập địa chỉ email.');
      setIsSubmitting(false);
      return;
    }

    try {
      await resetPassword({ username: normalizedEmail });
      setSuccess('Mã khôi phục đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
      setStep('confirm');
      setEmail(normalizedEmail);
      
      // Update URL to include email
      window.history.replaceState({}, '', `/forgot-password?email=${encodeURIComponent(normalizedEmail)}`);
    } catch (err) {
      console.error('Reset password error:', err);
      
      // Parse Cognito error
      const errorName = typeof err === 'object' && err !== null && 'name' in err
        ? String((err as { name?: string }).name)
        : '';
      
      if (errorName === 'UserNotFoundException') {
        setError('Email này chưa được đăng ký tài khoản.');
      } else if (errorName === 'LimitExceededException') {
        setError('Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau 15 phút.');
      } else {
        const message = err instanceof Error ? err.message : 'Không thể gửi mã khôi phục.';
        setError(`Lỗi: ${message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    if (!normalizedEmail || !trimmedCode || !newPassword) {
      setError('Vui lòng điền đầy đủ thông tin.');
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      setIsSubmitting(false);
      return;
    }

    try {
      await confirmResetPassword({
        username: normalizedEmail,
        confirmationCode: trimmedCode,
        newPassword: newPassword,
      });
      
      setSuccess('Đổi mật khẩu thành công! Đang chuyển đến trang đăng nhập...');
      
      // Redirect to login after 2s
      setTimeout(() => {
        navigate('/login', { state: { message: 'Mật khẩu đã được đổi. Vui lòng đăng nhập lại.' } });
      }, 2000);
    } catch (err) {
      console.error('Confirm reset password error:', err);
      
      const errorName = typeof err === 'object' && err !== null && 'name' in err
        ? String((err as { name?: string }).name)
        : '';
      
      if (errorName === 'CodeMismatchException') {
        setError('Mã xác nhận không đúng. Vui lòng kiểm tra lại.');
      } else if (errorName === 'ExpiredCodeException') {
        setError('Mã xác nhận đã hết hạn. Vui lòng yêu cầu gửi mã mới.');
        setStep('request');
      } else if (errorName === 'InvalidPasswordException') {
        setError('Mật khẩu không đủ mạnh. Cần có chữ hoa, chữ thường, số và ký tự đặc biệt.');
      } else {
        const message = err instanceof Error ? err.message : 'Không thể đổi mật khẩu.';
        setError(`Lỗi: ${message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Email không hợp lệ.');
      return;
    }

    try {
      await resetPassword({ username: normalizedEmail });
      setSuccess('Mã xác nhận mới đã được gửi đến email của bạn.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể gửi lại mã.';
      setError(`Lỗi: ${message}`);
    }
  };

  return (
    <div className="page content">
      <section className="auth-section">
        <div className="container">
          <div className="login-container">
            <h2 className="login-title">Khôi phục mật khẩu</h2>
            <p className="login-desc">
              {step === 'request' 
                ? 'Nhập email để nhận mã khôi phục mật khẩu'
                : 'Nhập mã xác nhận và mật khẩu mới'}
            </p>

            {step === 'request' ? (
              <form onSubmit={handleRequestReset}>
                <label className="form-label">Email đăng ký</label>
                <div className="input-group">
                  <i className="fa-solid fa-envelope"></i>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-success">{success}</p>}

                <button className="btn-login" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang gửi...' : 'Gửi mã khôi phục'}
                </button>

                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <Link to="/login" className="forgot">
                    ← Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset}>
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f0f8ff', borderRadius: '8px', fontSize: '0.9rem' }}>
                  <i className="fa-solid fa-info-circle" style={{ color: '#20803F', marginRight: '0.5rem' }}></i>
                  Mã xác nhận đã được gửi đến: <strong>{email}</strong>
                </div>

                <label className="form-label">Mã xác nhận (6 số)</label>
                <div className="input-group">
                  <i className="fa-solid fa-key"></i>
                  <input
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    autoComplete="one-time-code"
                    required
                  />
                </div>

                <label className="form-label">Mật khẩu mới</label>
                <div className="input-group">
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tối thiểu 8 ký tự"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <span
                    className="show-pass"
                    role="button"
                    tabIndex={0}
                    onClick={() => setShowPassword((prev) => !prev)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setShowPassword((prev) => !prev);
                      }
                    }}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
                  Mật khẩu cần có: chữ hoa, chữ thường, số và ký tự đặc biệt
                </div>

                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-success">{success}</p>}

                <button className="btn-login" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </button>

                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    className="forgot"
                    onClick={handleResendCode}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Gửi lại mã xác nhận
                  </button>
                  <br />
                  <button
                    type="button"
                    className="forgot"
                    onClick={() => {
                      setStep('request');
                      setCode('');
                      setNewPassword('');
                      setError('');
                      setSuccess('');
                      window.history.replaceState({}, '', '/forgot-password');
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}
                  >
                    ← Đổi email khác
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
