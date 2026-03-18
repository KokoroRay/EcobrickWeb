import { useAuth } from '../context/AuthContext';
import { useRewards } from '../context/RewardsContext';
import '../styles/user-ui.css';

export default function Profile() {
    const { user, userAttributes } = useAuth();
    const { points, history } = useRewards();

    const stats = {
        donations: history.filter(h => h.type === 'donate' && h.status === 'approved').length,
        totalKg: history.filter(h => h.type === 'donate' && h.status === 'approved').reduce((sum, h) => sum + (h.kg || 0), 0),
        vouchers: history.filter(h => h.type === 'redeem').length
    };

    return (
        <div className="page content user-page profile-page">
            <div className="container">
                <div className="profile-page-wrap">
                    {/* Header */}
                    <div className="card profile-hero-card">
                        <div style={{ width: '100px', height: '100px', background: '#20803F', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', fontWeight: 700 }}>
                            {userAttributes?.name?.[0] || user?.username?.[0] || 'U'}
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#1e293b' }}>{userAttributes?.name || user?.username}</h1>
                            <p style={{ color: '#64748b' }}>{userAttributes?.email}</p>
                            <div style={{ marginTop: '1.5rem', display: 'inline-flex', background: '#dcfce7', color: '#166534', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 600 }}>
                                {points} Điểm Ecobricks
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="profile-stats-grid">
                        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#20803F', marginBottom: '0.5rem' }}>{stats.donations}</div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Lần quyên góp</div>
                        </div>
                        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#20803F', marginBottom: '0.5rem' }}>{stats.totalKg}</div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Kg nhựa đã góp</div>
                        </div>
                        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.5rem' }}>{stats.vouchers}</div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Voucher đã đổi</div>
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Thông tin tài khoản</h3>
                        <div className="profile-info-grid">
                            <div className="profile-info-row">
                                <span style={{ color: '#64748b' }}>Tên đăng nhập</span>
                                <span style={{ fontWeight: 500 }}>{user?.username}</span>
                            </div>
                            <div className="profile-info-row">
                                <span style={{ color: '#64748b' }}>Email</span>
                                <span style={{ fontWeight: 500 }}>{userAttributes?.email}</span>
                            </div>
                            <div className="profile-info-row">
                                <span style={{ color: '#64748b' }}>Họ và tên</span>
                                <span style={{ fontWeight: 500 }}>{userAttributes?.name || 'Chưa cập nhật'}</span>
                            </div>
                            <div className="profile-info-row">
                                <span style={{ color: '#64748b' }}>Trạng thái</span>
                                <span style={{ color: '#20803F', fontWeight: 600 }}>Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
