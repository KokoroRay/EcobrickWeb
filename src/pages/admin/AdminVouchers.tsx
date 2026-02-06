import { useState } from 'react';
import { useRewards } from '../../context/RewardsContext';
import { Voucher } from '../../types/rewards';

export default function AdminVouchers() {
    const { availableVouchers, addVoucher, deleteVoucher, editVoucher, config, updatePointsPerKg } = useRewards();
    const [pointsPerKg, setPointsPerKg] = useState<string>(config.pointsPerKg.toString());

    // Form State
    const [voucherTitle, setVoucherTitle] = useState('Voucher mới');
    const [voucherPoints, setVoucherPoints] = useState<string>('200');
    const [voucherDiscount, setVoucherDiscount] = useState('8%');
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleUpdateConfig = () => {
        const val = Number(pointsPerKg);
        if (val > 0) {
            updatePointsPerKg(val);
            alert('Đã cập nhật tỷ lệ quy đổi!');
        }
    };

    const handleSaveVoucher = () => {
        const points = Number(voucherPoints) || 0;
        if (points <= 0) {
            alert("Điểm yêu cầu phải lớn hơn 0");
            return;
        }

        if (editingId) {
            // Edit Mode
            const existing = availableVouchers.find(v => v.id === editingId);
            if (existing) {
                editVoucher({
                    ...existing,
                    title: voucherTitle,
                    discount: voucherDiscount,
                    pointsRequired: points
                });
                alert("Đã cập nhật voucher!");
            }
            setEditingId(null);
        } else {
            // Add Mode
            addVoucher({
                title: voucherTitle,
                code: `ADMIN-${Date.now().toString().slice(-4)}`,
                discount: voucherDiscount,
                pointsRequired: points,
                expiresAt: '2026-12-31',
            });
            alert("Đã thêm voucher mới!");
        }

        // Reset Form
        setVoucherTitle('Voucher mới');
        setVoucherPoints('200');
        setVoucherDiscount('8%');
    };

    const startEdit = (voucher: Voucher) => {
        setEditingId(voucher.id);
        setVoucherTitle(voucher.title);
        setVoucherPoints(voucher.pointsRequired.toString());
        setVoucherDiscount(voucher.discount);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setVoucherTitle('Voucher mới');
        setVoucherPoints('200');
        setVoucherDiscount('8%');
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Bạn có chắc muốn xóa voucher này không?")) {
            deleteVoucher(id);
        }
    };

    return (
        <div>
            <div className="admin-page-header">
                <h2 className="admin-page-title">Cấu hình & Voucher</h2>
                <p className="admin-page-desc">Quản lý tỷ lệ quy đổi và kho quà tặng.</p>
            </div>

            <div className="stats-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

                <div className="stat-widget">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                        <i className="fa-solid fa-scale-balanced" style={{ color: '#20803F', marginRight: '0.5rem' }}></i>
                        Tỷ lệ quy đổi
                    </h3>

                    <div className="form-input-group">
                        <label>Điểm thưởng / 1 kg nhựa</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="number"
                                min={1}
                                className="form-field"
                                value={pointsPerKg}
                                onChange={(event) => setPointsPerKg(event.target.value)}
                            />
                            <button className="btn primary" onClick={handleUpdateConfig}>Lưu</button>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
                            Giá trị hiện tại: <strong>1 kg = {config.pointsPerKg} điểm</strong>
                        </div>
                    </div>
                </div>

                <div className="stat-widget">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                        <i className="fa-solid fa-ticket" style={{ color: '#20803F', marginRight: '0.5rem' }}></i>
                        {editingId ? 'Cập nhật Voucher' : 'Tạo Voucher mới'}
                    </h3>

                    <div className="form-input-group">
                        <label>Tên Voucher</label>
                        <input
                            type="text"
                            className="form-field"
                            value={voucherTitle}
                            onChange={(event) => setVoucherTitle(event.target.value)}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-input-group">
                            <label>Điểm cần đổi</label>
                            <input
                                type="number"
                                min={50}
                                className="form-field"
                                value={voucherPoints}
                                onChange={(event) => setVoucherPoints(event.target.value)}
                            />
                        </div>
                        <div className="form-input-group">
                            <label>Mức giảm giá</label>
                            <input
                                type="text"
                                className="form-field"
                                value={voucherDiscount}
                                onChange={(event) => setVoucherDiscount(event.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        {editingId && (
                            <button className="btn outline" onClick={cancelEdit}>Hủy</button>
                        )}
                        <button className="btn outline" onClick={handleSaveVoucher} style={{ borderColor: editingId ? '#20803F' : undefined, color: editingId ? '#20803F' : undefined }}>
                            {editingId ? <><i className="fa-solid fa-save"></i> Cập nhật</> : <><i className="fa-solid fa-plus"></i> Thêm Voucher</>}
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-card" style={{ marginTop: '2rem' }}>
                <div className="table-header-actions">
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', color: '#64748b' }}>
                        Danh sách Voucher hiện hành ({availableVouchers.length})
                    </h3>
                </div>
                <table className="pro-table">
                    <thead>
                        <tr>
                            <th>Tên Voucher</th>
                            <th>Mã (Auto)</th>
                            <th>Trị giá</th>
                            <th>Điểm yêu cầu</th>
                            <th>Hạn sử dụng</th>
                            <th style={{ textAlign: 'right' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {availableVouchers.map((voucher) => (
                            <tr key={voucher.id}>
                                <td>
                                    <div className="text-bold">{voucher.title}</div>
                                </td>
                                <td>
                                    <code style={{ background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}>{voucher.code}</code>
                                </td>
                                <td style={{ color: '#20803F', fontWeight: 600 }}>{voucher.discount}</td>
                                <td>{voucher.pointsRequired} điểm</td>
                                <td className="text-muted">{voucher.expiresAt}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <button
                                        className="btn outline sm"
                                        onClick={() => startEdit(voucher)}
                                        style={{ marginRight: '0.5rem' }}
                                        title="Chỉnh sửa"
                                    >
                                        <i className="fa-solid fa-pen"></i>
                                    </button>
                                    <button
                                        className="btn outline sm"
                                        onClick={() => handleDelete(voucher.id)}
                                        style={{ color: '#ef4444', borderColor: '#ef4444' }}
                                        title="Xóa"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
