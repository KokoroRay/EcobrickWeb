import { useRewards } from '../context/RewardsContext';
// import { formatDate } from '../utils/date'; 
// Inline format if utils not found easily or just define it.
// I'll define local format helper.

const formatTime = (isoString: string) => {
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
        return isoString;
    }
};

export default function History() {
    const { history, claimedVouchers } = useRewards();

    // Filter types
    const pointHistory = history; // All history
    const redeemHistory = history.filter(h => h.type === 'redeem');

    return (
        <div className="page content" style={{ background: '#f8fafc', padding: '3rem 0', minHeight: '80vh' }}>
            <div className="container">
                <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '2rem' }}>Lịch sử hoạt động</h2>

                <div style={{ display: 'grid', gap: '3rem' }}>

                    {/* 1. Transaction History */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.4rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <i className="fa-solid fa-clock-rotate-left" style={{ color: '#20803F' }}></i>
                            Lịch sử tích & đổi điểm
                        </h3>

                        {pointHistory.length === 0 ? (
                            <p style={{ color: '#64748b', fontStyle: 'italic' }}>Chưa có hoạt động nào.</p>
                        ) : (
                            <div className="activity-list">
                                {pointHistory.map(item => (
                                    <div key={item.id} className="activity-item">
                                        <div className={`activity-icon icon-${item.type === 'donate' ? 'donate' : item.type === 'redeem' ? 'redeem' : 'admin'}`}>
                                            <i className={`fa-solid ${item.type === 'donate' ? 'fa-recycle' : item.type === 'redeem' ? 'fa-ticket' : 'fa-user-pen'}`}></i>
                                        </div>
                                        <div className="activity-details">
                                            <div className="activity-title">
                                                {item.type === 'donate' ? 'Quyên góp nhựa' : item.type === 'redeem' ? 'Đổi voucher' : 'Điều chỉnh từ Admin'}
                                                {item.kg ? ` (${item.kg} kg)` : ''}
                                            </div>
                                            <div className="activity-date">{formatTime(item.createdAt)}</div>
                                            {item.note && <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>"{item.note}"</div>}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div className={`activity-amount ${item.points > 0 ? 'amount-plus' : 'amount-minus'}`}>
                                                {item.points > 0 ? '+' : ''}{item.points} điểm
                                            </div>
                                            <div className={`status-indicator st-${item.status || 'approved'}`}>
                                                {item.status === 'pending' ? 'Đang duyệt' : item.status === 'rejected' ? 'Từ chối' : 'Thành công'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. Voucher Stats */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.4rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <i className="fa-solid fa-ticket" style={{ color: '#f59e0b' }}></i>
                            Lịch sử Voucher đã đổi
                        </h3>

                        {claimedVouchers.length === 0 ? (
                            <p style={{ color: '#64748b', fontStyle: 'italic' }}>Bạn chưa đổi voucher nào.</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {claimedVouchers.map(voucher => (
                                    <div key={voucher.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', background: '#fff', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#f59e0b' }}></div>
                                        <div style={{ marginBottom: '0.5rem', fontWeight: 700, color: '#334155' }}>{voucher.title}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div style={{ color: '#20803F', fontWeight: 600, fontSize: '1.1rem' }}>{voucher.discount}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>HSD: {voucher.expiresAt}</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '6px', textAlign: 'center', border: '1px dashed #cbd5e1', fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                                            {voucher.code}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
