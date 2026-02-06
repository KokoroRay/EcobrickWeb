import { useMemo } from 'react';
import { useRewards } from '../../context/RewardsContext';
import { useToast } from '../../context/ToastContext';

export default function AdminOrders() {
    const { allUsers, updateDonationStatus } = useRewards();
    const { showToast } = useToast();

    const pendingOrders = useMemo(() => {
        return allUsers.flatMap(user =>
            user.history
                .filter(h => h.status === 'pending' && h.type === 'donate')
                .map(h => ({ ...h, userName: user.name, userEmail: user.email }))
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [allUsers]);

    const handleUpdateStatus = (uid: string, id: string, status: 'approved' | 'rejected') => {
        updateDonationStatus(uid, id, status);
        if (status === 'approved') {
            showToast('Đã phê duyệt yêu cầu quyên góp!', 'success');
        } else {
            showToast('Đã từ chối yêu cầu.', 'error');
        }
    };

    if (pendingOrders.length === 0) {
        return (
            <div>
                <div className="admin-page-header">
                    <h2 className="admin-page-title">Quản lý quyên góp</h2>
                    <p className="admin-page-desc">Duyệt và kiểm tra các yêu cầu gửi nhựa từ thành viên.</p>
                </div>
                <div className="admin-empty-state">
                    <i className="fa-solid fa-clipboard-check"></i>
                    <h3>Không có yêu cầu mới</h3>
                    <p>Tất cả các đơn đã được xử lý.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="admin-page-header">
                <h2 className="admin-page-title">Quản lý quyên góp</h2>
                <p className="admin-page-desc">Có <strong>{pendingOrders.length}</strong> yêu cầu cần phê duyệt.</p>
            </div>

            <div className="table-card">
                <table className="pro-table">
                    <thead>
                        <tr>
                            <th>Người gửi</th>
                            <th>Thời gian</th>
                            <th>Khối lượng</th>
                            <th>Điểm quy đổi</th>
                            <th>Ghi chú</th>
                            <th style={{ textAlign: 'right' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingOrders.map(order => (
                            <tr key={order.id}>
                                <td>
                                    <div className="text-bold">{order.userName}</div>
                                    <div className="text-sm text-muted">{order.userEmail}</div>
                                </td>
                                <td>{order.createdAt}</td>
                                <td>
                                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{order.kg}</span> <span className="text-muted text-sm">kg</span>
                                </td>
                                <td style={{ color: '#16a34a', fontWeight: 600 }}>+{order.points} điểm</td>
                                <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {order.note}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn outline sm"
                                            style={{ borderColor: '#ef4444', color: '#ef4444', padding: '0.4rem 0.8rem' }}
                                            onClick={() => handleUpdateStatus(order.userId || '', order.id, 'rejected')}
                                            title="Từ chối"
                                        >
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                        <button
                                            className="btn primary sm"
                                            style={{ padding: '0.4rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            onClick={() => handleUpdateStatus(order.userId || '', order.id, 'approved')}
                                        >
                                            <i className="fa-solid fa-check"></i> Duyệt
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
