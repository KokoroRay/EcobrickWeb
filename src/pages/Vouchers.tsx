import { useRewards } from '../context/RewardsContext';

export default function Vouchers() {
  const { claimedVouchers, availableVouchers } = useRewards();

  return (
    <section className="page content">
      <div className="section pad">
        <h2 className="section-title">VOUCHER CỦA BẠN</h2>
        <p className="section-sub">Voucher đã đổi và đang sẵn sàng sử dụng.</p>

        <div className="voucher-grid" style={{ marginBottom: '2rem' }}>
          {claimedVouchers.length === 0 ? (
            <div className="voucher-card">
              <h3>Chưa có voucher</h3>
              <p>Hãy đổi điểm để nhận voucher đầu tiên.</p>
            </div>
          ) : (
            claimedVouchers.map((voucher) => (
              <div className="voucher-card" key={voucher.id}>
                <span className="badge">{voucher.discount}</span>
                <h3>{voucher.title}</h3>
                <p>Mã: <strong>{voucher.code}</strong></p>
                <p>Hạn sử dụng: {voucher.expiresAt}</p>
              </div>
            ))
          )}
        </div>

        <h2 className="section-title">Voucher đề xuất</h2>
        <div className="voucher-grid">
          {availableVouchers.map((voucher) => (
            <div className="voucher-card" key={voucher.id}>
              <span className="badge">{voucher.discount}</span>
              <h3>{voucher.title}</h3>
              <p>Điểm cần: {voucher.pointsRequired}</p>
              <p>Hạn sử dụng: {voucher.expiresAt}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
