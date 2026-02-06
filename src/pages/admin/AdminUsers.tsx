import { useState } from 'react';
import { useRewards } from '../../context/RewardsContext';

type AdjustModalProps = {
    userId: string;
    userName: string;
    currentPoints: number;
    onClose: () => void;
    onConfirm: (points: number, reason: string) => void;
};

function AdjustPointsModal({ userId, userName, currentPoints, onClose, onConfirm }: AdjustModalProps) {
    const [points, setPoints] = useState(0);
    const [reason, setReason] = useState('');

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} className="admin-modal-overlay">
            <div style={{
                background: 'white', padding: '2rem', borderRadius: '12px', width: '400px'
            }} className="admin-modal">
                <h3 style={{ marginBottom: '1rem', color: '#0f172a' }}>Điều chỉnh điểm: {userName}</h3>
                <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
                    Hiện tại: <strong>{currentPoints} điểm</strong>
                </div>

                <div className="form-input-group">
                    <label>Số điểm (+/-)</label>
                    <input
                        type="number"
                        className="form-field"
                        value={points}
                        onChange={e => setPoints(Number(e.target.value))}
                        autoFocus
                    />
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Nhập số âm để trừ điểm.</div>
                </div>

                <div className="form-input-group">
                    <label>Lý do</label>
                    <input
                        type="text"
                        className="form-field"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="VD: Thưởng sự kiện..."
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                    <button className="btn outline sm" onClick={onClose} style={{ border: '1px solid #ddd', color: '#666' }}>Hủy</button>
                    <button className="btn primary sm" onClick={() => onConfirm(points, reason)}>Xác nhận</button>
                </div>
            </div>
        </div>
    );
}

export default function AdminUsers() {
    const { allUsers, adjustUserPoints } = useRewards();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<{ id: string, name: string, points: number } | null>(null);

    const filteredUsers = allUsers.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdjust = (points: number, reason: string) => {
        if (selectedUser) {
            adjustUserPoints(selectedUser.id, points, reason);
            setSelectedUser(null);
        }
    };

    return (
        <div>
            <div className="admin-page-header">
                <h2 className="admin-page-title">Quản lý người dùng</h2>
                <p className="admin-page-desc">Danh sách {allUsers.length} thành viên đã đăng ký.</p>
            </div>

            <div className="table-card">
                <div className="table-header-actions">
                    <div className="search-bar" style={{ maxWidth: '300px', margin: 0 }}>
                        <i className="fa-solid fa-magnifying-glass search-icon"></i>
                        <input
                            type="text"
                            placeholder="Tìm thành viên..."
                            className="search-input"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button className="btn outline sm" title="Tính năng xuất Excel đang phát triển">
                        <i className="fa-solid fa-download"></i> Xuất danh sách
                    </button>
                </div>

                <table className="pro-table">
                    <thead>
                        <tr>
                            <th>Thành viên</th>
                            <th>Điểm hiện tại</th>
                            <th>Tổng đóng góp</th>
                            <th>Trạng thái</th>
                            <th style={{ textAlign: 'right' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className="text-bold">{user.name}</div>
                                    <div className="text-sm text-muted">{user.email}</div>
                                </td>
                                <td>
                                    <span style={{ fontWeight: 700, color: '#16a34a' }}>{user.points}</span>
                                </td>
                                <td>{user.totalKg.toFixed(1)} kg</td>
                                <td>
                                    <span className="badge-status badge-approved">Hoạt động</span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button
                                        className="btn outline sm"
                                        style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                                        onClick={() => setSelectedUser({ id: user.id, name: user.name, points: user.points })}
                                    >
                                        <i className="fa-solid fa-sliders"></i> Điều chỉnh điểm
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedUser && (
                <AdjustPointsModal
                    userId={selectedUser.id}
                    userName={selectedUser.name}
                    currentPoints={selectedUser.points}
                    onClose={() => setSelectedUser(null)}
                    onConfirm={handleAdjust}
                />
            )}
        </div>
    );
}
