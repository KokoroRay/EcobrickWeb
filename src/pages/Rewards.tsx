import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRewards } from '../context/RewardsContext';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

export default function Rewards() {
  const { points, config, history, addDonation } = useRewards();
  const { user, userAttributes } = useAuth();
  const [kg, setKg] = useState(1);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const earned = kg * config.pointsPerKg;

  const handleSubmit = async () => {
    if (kg <= 0) return;
    setIsSubmitting(true);

    // addDonation internally handles authentication check and API call
    // It returns true on success, false on failure
    const success = await addDonation(kg, note || 'Quyên góp nhựa tại điểm thu gom');

    if (success) {
      setNote('');
      setKg(1);
    }

    setIsSubmitting(false);
  };

  // Helper to get display name
  const getDisplayName = () => {
    if (userAttributes?.name) return userAttributes.name;
    if (userAttributes?.email) return userAttributes.email.split('@')[0];
    if (user?.signInDetails?.loginId) return user.signInDetails.loginId.split('@')[0];
    return 'Thành viên';
  };

  const getEmail = () => {
    return userAttributes?.email || user?.signInDetails?.loginId || 'Chưa cập nhật email';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending': return <span className="status-indicator st-pending"><i className="fa-solid fa-clock"></i> Đang chờ duyệt</span>;
      case 'approved': return <span className="status-indicator st-approved"><i className="fa-solid fa-check"></i> Thành công</span>;
      case 'rejected': return <span className="status-indicator st-rejected"><i className="fa-solid fa-xmark"></i> Từ chối</span>;
      default: return null;
    }
  };

  const totalKg = history
    .filter(h => h.type === 'donate' && h.status === 'approved')
    .reduce((acc, curr) => acc + (curr.kg || 0), 0);

  return (
    <div className="page content" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '3rem' }}>
      <div className="container">

        {/* Breadcrumb / Title */}
        <div style={{ padding: '1.5rem 0' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>Tổng quan tài khoản</h1>
          <p style={{ color: '#64748b' }}>Quản lý điểm thưởng và đóng góp của bạn.</p>
        </div>

        <div className="dashboard-container">
          {/* Left Sidebar: Profile & Stats */}
          <aside>
            <div className="profile-card">
              <div className="profile-avatar">
                {getInitials()}
              </div>
              <div className="profile-info">
                <h2 className="profile-name">{getDisplayName()}</h2>
                <div className="profile-email">{getEmail()}</div>
                <div className="chip-muted" style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                  Thành viên Chính thức
                </div>
              </div>

              <div className="profile-stats">
                <div className="stat-item">
                  <h4>Điểm hiện có</h4>
                  <div className="value" style={{ color: '#16a34a' }}>{points}</div>
                </div>
                <div className="stat-item">
                  <h4>Tổng nhựa (kg)</h4>
                  <div className="value" style={{ color: '#3b82f6' }}>{totalKg}</div>
                </div>
              </div>
            </div>

            <div className="action-card" style={{ marginTop: '2rem', textAlign: 'center', background: 'linear-gradient(to right, #20803F, #16a34a)', color: 'white', border: 'none' }}>
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Đổi quà ngay?</h3>
              <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Sử dụng điểm tích lũy để đổi lấy voucher giảm giá hấp dẫn.</p>
              <Link to="/redeem" className="btn" style={{ background: 'white', color: '#15803d', border: 'none', width: '100%' }}>
                Xem kho quà <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </aside>

          {/* Right Main Content */}
          <main className="dashboard-main">

            {/* Donation Form */}
            <div className="action-card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Gửi yêu cầu tích điểm</h3>
                  <p className="card-subtitle">Nhập số lượng nhựa bạn đã gửi tại điểm thu gom.</p>
                </div>
                <div style={{ width: '40px', height: '40px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
                  <i className="fa-solid fa-recycle"></i>
                </div>
              </div>

              <div className="form-input-group">
                <label>Số lượng nhựa (kg)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  className="form-field"
                  value={kg}
                  onChange={(e) => setKg(Number(e.target.value))}
                />
              </div>

              <div className="form-input-group">
                <label>Ghi chú (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đã gửi tại KTX Khu A lúc 9h sáng..."
                  className="form-field"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="conversion-box">
                <i className="fa-solid fa-circle-info conversion-icon"></i>
                <div>
                  Bạn sẽ nhận được <strong>{Math.floor(earned)} điểm</strong> sau khi Admin phê duyệt.
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button
                  className="btn primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{ minWidth: '150px' }}
                >
                  {isSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Gửi yêu cầu'}
                </button>
              </div>
            </div>

            {/* History */}
            <div className="action-card">
              <div className="card-header">
                <h3 className="card-title">Hoạt động gần đây</h3>
                <Link to="/history" style={{ fontSize: '0.9rem', color: '#20803F', fontWeight: 600 }}>Xem tất cả</Link>
              </div>

              <div className="activity-list">
                {history.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    Chưa có hoạt động nào. Hãy bắt đầu quyên góp!
                  </div>
                )}
                {history.slice(0, 5).map((entry) => (
                  <div className="activity-item" key={entry.id}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div className={`activity-icon ${entry.type === 'donate' ? 'icon-donate' : (entry.type === 'redeem' ? 'icon-redeem' : 'icon-admin')}`}>
                        <i className={`fa-solid ${entry.type === 'donate' ? 'fa-leaf' : (entry.type === 'redeem' ? 'fa-gift' : 'fa-user-gear')}`}></i>
                      </div>
                      <div className="activity-details">
                        <div className="activity-title">{entry.note}</div>
                        <div className="activity-date">{entry.createdAt}</div>
                        {getStatusBadge(entry.status)}
                      </div>
                    </div>
                    <div className={`activity-amount ${entry.points > 0 ? 'amount-plus' : 'amount-minus'}`}>
                      {entry.points > 0 ? '+' : ''}{entry.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
