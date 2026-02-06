import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { confirmSignUp, resendSignUpCode, signInWithRedirect, signUp } from 'aws-amplify/auth';

export default function Register() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 100 }, (_, index) => String(currentYear - index)),
    [currentYear],
  );
  const months = useMemo(() => Array.from({ length: 12 }, (_, index) => String(index + 1)), []);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [countryCode, setCountryCode] = useState('+84');
  const [phone, setPhone] = useState('');
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [step, setStep] = useState<'signup' | 'confirm'>('signup');
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [confirmSuccess, setConfirmSuccess] = useState('');

  const days = useMemo(() => {
    if (!month) return [];
    const numericYear = year ? Number(year) : currentYear;
    const numericMonth = Number(month);
    if (Number.isNaN(numericMonth) || numericMonth < 1 || numericMonth > 12) return [];
    const maxDays = new Date(numericYear, numericMonth, 0).getDate();
    return Array.from({ length: maxDays }, (_, index) => String(index + 1));
  }, [month, year, currentYear]);

  // Reset day when month changes if current day is invalid
  useEffect(() => {
    if (day && days.length > 0 && Number(day) > days.length) {
      setDay('');
    }
  }, [days, day]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!acceptPolicy) {
      setError('Vui lòng đồng ý điều khoản trước khi tạo tài khoản.');
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const birthdate = day && month && year
        ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        : undefined;
      const trimmedPhone = phone.replace(/\s+/g, '');
      const phoneNumber = trimmedPhone ? `${countryCode}${trimmedPhone}` : undefined;

      await signUp({
        username: normalizedEmail,
        password,
        options: {
          userAttributes: {
            name: fullName.trim(),
            email: normalizedEmail,
            ...(birthdate ? { birthdate } : {}),
            ...(phoneNumber ? { phone_number: phoneNumber } : {}),
          },
        },
      });

      setSuccess('Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản.');
      setStep('confirm');
      setConfirmSuccess('');
      setConfirmationCode('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng ký thất bại.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setSuccess('');
    const hasOauthConfig = Boolean(import.meta.env.VITE_COGNITO_DOMAIN);
    if (!hasOauthConfig) {
      setError('Chưa cấu hình đăng nhập Google trong Cognito.');
      return;
    }

    await signInWithRedirect({ provider: 'Google' });
  };

  const handleConfirmSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConfirmError('');
    setConfirmSuccess('');
    setIsConfirming(true);
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setConfirmError('Vui lòng nhập lại email đã đăng ký.');
      setIsConfirming(false);
      return;
    }

    try {
      await confirmSignUp({
        username: normalizedEmail,
        confirmationCode: confirmationCode.trim(),
      });
      setConfirmSuccess('Xác nhận thành công. Bạn có thể đăng nhập ngay.');
      window.setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Xác nhận thất bại.';
      setConfirmError(message);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleResendCode = async () => {
    setConfirmError('');
    setConfirmSuccess('');
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setConfirmError('Vui lòng nhập lại email đã đăng ký.');
      return;
    }

    try {
      await resendSignUpCode({ username: normalizedEmail });
      setConfirmSuccess('Mã xác nhận đã được gửi lại.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể gửi lại mã.';
      setConfirmError(message);
    }
  };

  return (
    <div className="page content">
      <section className="auth-section">
        <div className="container">
          <div className="signup-container">
          <h2 className="signup-title">Tạo tài khoản</h2>
          <p className="signup-note">Đăng ký nhanh để nhận điểm thưởng</p>
          <p className="signup-desc">
            Thông tin của bạn sẽ được dùng để tích điểm từ nhựa và đổi ưu đãi khi mua gạch Ecobrick.
          </p>

          {step === 'signup' ? (
            <form onSubmit={handleSubmit}>
            <label className="form-label">Họ và tên</label>
            <div className="input-group">
              <i className="fa-solid fa-user"></i>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <label className="form-label">Email</label>
            <div className="input-group">
              <i className="fa-solid fa-envelope"></i>
              <input
                type="email"
                placeholder="email@ecobrick.example"
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
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
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
            <p className="password-hint">Tối thiểu 8 ký tự, gồm chữ hoa và số.</p>

            <label className="form-label">Ngày sinh</label>
            <div className="date-group">
              <select value={day} onChange={(event) => setDay(event.target.value)}>
                <option value="">Ngày</option>
                {days.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <select value={month} onChange={(event) => setMonth(event.target.value)}>
                <option value="">Tháng</option>
                {months.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <select value={year} onChange={(event) => setYear(event.target.value)}>
                <option value="">Năm</option>
                {years.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <label className="form-label">Số điện thoại</label>
            <div className="phone-group">
              <select value={countryCode} onChange={(event) => setCountryCode(event.target.value)}>
                <option value="+84">+84</option>
                <option value="+1">+1</option>
                <option value="+81">+81</option>
              </select>
              <input
                type="text"
                placeholder="0909 123 456"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
              />
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="policy"
                checked={acceptPolicy}
                onChange={(event) => setAcceptPolicy(event.target.checked)}
              />
              <label htmlFor="policy">
                Tôi đồng ý với các điều khoản và chính sách bảo mật của Ecobrick.
              </label>
            </div>

            {error ? <p className="auth-error">{error}</p> : null}
            {success ? <p className="auth-success">{success}</p> : null}

            <button className="btn-signup" type="submit">
              {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>

            <div className="divider">
              <span>hoặc</span>
            </div>

            <button className="btn-google google-btn" type="button" onClick={handleGoogleSignup}>
              <i className="fab fa-google"></i>
              Đăng ký với Google
            </button>

            <div className="signup-section">
              <p className="signup-desc">Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
            </div>
          </form>
          ) : (
            <div className="signup-section">
              <p className="signup-title">Xác nhận tài khoản</p>
              <p className="signup-desc">Nhập mã xác thực được gửi đến email của bạn.</p>
              <form onSubmit={handleConfirmSubmit}>
                <div className="input-group">
                  <i className="fa-solid fa-key"></i>
                  <input
                    type="text"
                    placeholder="Mã xác thực"
                    value={confirmationCode}
                    onChange={(event) => setConfirmationCode(event.target.value)}
                    autoComplete="one-time-code"
                    required
                  />
                </div>
                {confirmError ? <p className="auth-error">{confirmError}</p> : null}
                {confirmSuccess ? <p className="auth-success">{confirmSuccess}</p> : null}
                <button className="btn-signup" type="submit">
                  {isConfirming ? 'Đang xác nhận...' : 'Xác nhận'}
                </button>
                <button className="btn-signup secondary" type="button" onClick={handleResendCode}>
                  Gửi lại mã
                </button>
                <button className="btn-signup secondary" type="button" onClick={() => setStep('signup')}>
                  Quay lại đăng ký
                </button>
              </form>
            </div>
          )}
        </div>
        </div>
      </section>
    </div>
  );
}
