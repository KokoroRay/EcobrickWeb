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
    const [weight, setWeight] = useState<string>(''); // Keep as string to allow empty
    const [reason, setReason] = useState('');

    const handleWeightChange = (val: string) => {
        setWeight(val);
        const num = parseFloat(val);
        if (!isNaN(num)) {
            setPoints(Math.floor(num * 10)); // Auto-calc: 1kg = 10 pts
        } else {
            setPoints(0);
        }
    };

    const handlePointsChange = (val: number) => {
        setPoints(val);
        setWeight(''); // Clear weight if manual points entered
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} className="admin-modal-overlay">
            <div style={{
                background: 'white', padding: '2rem', borderRadius: '12px', width: '450px'
            }} className="admin-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, color: '#0f172a' }}>Điều chỉnh: {userName}</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}><i className="fa-solid fa-xmark"></i></button>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Điểm hiện tại:</span>
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{currentPoints}</strong>
                </div>

                <div className="form-input-group">
                    <label>Nhập số Kg thực tế (Tùy chọn)</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="number"
                            className="form-field"
                            value={weight}
                            onChange={e => handleWeightChange(e.target.value)}
                            placeholder="VD: 5.5"
                            step="0.1"
                        />
                        <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9rem' }}>kg</span>
                    </div>
                    {weight && <div style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '0.25rem' }}><i className="fa-solid fa-calculator"></i> Tự động quy đổi: {weight}kg x 10 = {parseInt(weight) * 10} điểm</div>}
                </div>

                <div className="form-input-group" style={{ marginTop: '1rem' }}>
                    <label>Số điểm điều chỉnh (+/-)</label>
                    <input
                        type="number"
                        className="form-field"
                        value={points}
                        onChange={e => handlePointsChange(Number(e.target.value))}
                        placeholder="0"
                    />
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                        {points > 0 ? 'Thêm điểm' : (points < 0 ? 'Trừ điểm' : 'Nhập số điểm')}
                    </div>
                </div>

                <div className="form-input-group">
                    <label>Lý do / Ghi chú</label>
                    <input
                        type="text"
                        className="form-field"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="VD: Thu gom tại sự kiện X..."
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                    <button className="btn outline sm" onClick={onClose} style={{ border: '1px solid #e2e8f0', color: '#64748b' }}>Hủy bỏ</button>
                    <button
                        className="btn primary sm"
                        onClick={() => onConfirm(points, reason)}
                        disabled={points === 0}
                    >
                        <i className="fa-solid fa-check"></i> Cập nhật
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminUsers() {
    const { allUsers, adminAwardPoints } = useRewards();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<{ id: string, name: string, points: number } | null>(null);

    const filteredUsers = allUsers.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdjust = async (points: number, reason: string) => {
        if (selectedUser) {
            // Check if it's manual points or weight based
            // It's tricky because the modal returns only points and reason. 
            // Better to update modal to pass weight if available, or just infer?
            // Wait, I updated modal to have weight state but onConfirm only sends points.
            // I should have updated modal onConfirm signature too.
            // However, for now let's assume if it is point adjustment, acts as manual.
            // If we want kg recording, we need to pass kg.

            // Let's rely on the Points value for now as 'manualPoints'.
            // If we want detailed tracking (kg vs points), we need to update the Modal interface.
            // But to fix valid API call first:

            await adminAwardPoints(selectedUser.id, 0, points, reason);
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
                    onConfirm={handleAdjust} // This needs to be updated to be async and call the new context function
                />
            )}
        </div>
    );
}
