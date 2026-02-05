import { useMemo, useState } from 'react';
import { useRewards } from '../context/RewardsContext';

const mockUsers = [
  { id: 'user-1', name: 'Nguyễn Văn A', points: 320, totalKg: 32 },
  { id: 'user-2', name: 'Trần Thị B', points: 540, totalKg: 54 },
  { id: 'user-3', name: 'Lê Minh C', points: 120, totalKg: 12 },
];

export default function Admin() {
  const { config, updatePointsPerKg, availableVouchers, addVoucher } = useRewards();
  const [pointsPerKg, setPointsPerKg] = useState(config.pointsPerKg);
  const [voucherTitle, setVoucherTitle] = useState('Voucher mới');
  const [voucherPoints, setVoucherPoints] = useState(200);
  const [voucherDiscount, setVoucherDiscount] = useState('8%');

  const totalKg = useMemo(() => mockUsers.reduce((total, user) => total + user.totalKg, 0), []);

  const handleUpdateConfig = () => {
    updatePointsPerKg(pointsPerKg);
  };

  const handleAddVoucher = () => {
    addVoucher({
      title: voucherTitle,
      code: `ADMIN-${Date.now().toString().slice(-4)}`,
      discount: voucherDiscount,
      pointsRequired: voucherPoints,
      expiresAt: '2026-12-31',
    });
  };

  return (
    <div className="page content">
      <section className="section pad">
        <div className="container">
        <h2 className="section-title">BẢNG ĐIỀU KHIỂN ADMIN</h2>
        <p className="section-sub">Quản lý người dùng, quy đổi điểm và voucher ưu đãi.</p>

        <div className="admin-grid">
          <div className="admin-card">
            <h3>Thống kê nhựa thu gom</h3>
            <p>Tổng số kg nhựa: <strong>{totalKg} kg</strong></p>
            <p>Số người tham gia: <strong>{mockUsers.length}</strong></p>
            <span className="chip-muted">Cập nhật theo dữ liệu hệ thống</span>
          </div>

          <div className="admin-card">
            <h3>Chỉnh quy đổi điểm</h3>
            <label>
              Điểm / 1 kg
              <input
                type="number"
                min={1}
                value={pointsPerKg}
                onChange={(event) => setPointsPerKg(Number(event.target.value))}
              />
            </label>
            <button className="btn primary" type="button" onClick={handleUpdateConfig}>
              Cập nhật quy đổi
            </button>
          </div>

          <div className="admin-card">
            <h3>Tạo / chỉnh sửa voucher</h3>
            <label>
              Tên voucher
              <input
                type="text"
                value={voucherTitle}
                onChange={(event) => setVoucherTitle(event.target.value)}
              />
            </label>
            <label>
              Điểm cần
              <input
                type="number"
                min={50}
                value={voucherPoints}
                onChange={(event) => setVoucherPoints(Number(event.target.value))}
              />
            </label>
            <label>
              Giảm giá
              <input
                type="text"
                value={voucherDiscount}
                onChange={(event) => setVoucherDiscount(event.target.value)}
              />
            </label>
            <button className="btn outline" type="button" onClick={handleAddVoucher}>
              Thêm voucher
            </button>
          </div>
        </div>

        <div className="admin-card" style={{ marginTop: '2rem' }}>
          <h3>Quản lý người dùng</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Điểm</th>
                <th>Kg nhựa</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.points}</td>
                  <td>{user.totalKg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-card" style={{ marginTop: '2rem' }}>
          <h3>Danh sách voucher</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Voucher</th>
                <th>Điểm cần</th>
                <th>Hạn sử dụng</th>
              </tr>
            </thead>
            <tbody>
              {availableVouchers.map((voucher) => (
                <tr key={voucher.id}>
                  <td>{voucher.title}</td>
                  <td>{voucher.pointsRequired}</td>
                  <td>{voucher.expiresAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </section>
    </div>
  );
}
