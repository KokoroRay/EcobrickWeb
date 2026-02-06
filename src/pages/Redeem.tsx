import { useState } from 'react';
import { useRewards } from '../context/RewardsContext';

export default function Redeem() {
  const { config, points, redeemOption, availableVouchers } = useRewards();
  const [message, setMessage] = useState('');

  const handleRedeem = async (id: string) => {
    // We now look in availableVouchers (Backend) first
    const option = availableVouchers.find((v) => v.id === id);
    if (!option) return;

    // redeemOption is async now
    const result = await redeemOption(option);
    setMessage(result.message);
  };

  return (
    <div className="page content">
      <section className="section pad">
        <div className="container">
          <h2 className="section-title">ĐỔI ĐIỂM LẤY VOUCHER</h2>
          <p className="section-sub">Điểm hiện có: <strong>{points}</strong></p>

          {message && (
            <div className="chip-muted" style={{ margin: '0 auto 1.5rem', display: 'inline-block' }}>
              {message}
            </div>
          )}

          <div className="voucher-grid">
            {availableVouchers.length > 0 ? (
              availableVouchers.map((voucher) => (
                <div className="voucher-card" key={voucher.id}>
                  <span className="badge">{voucher.discount}</span>
                  <h3>{voucher.title}</h3>
                  <p>Điểm cần: <strong>{voucher.pointsRequired}</strong></p>
                  <p>Hạn sử dụng: {voucher.expiresAt}</p>
                  <button className="btn primary" type="button" onClick={() => handleRedeem(voucher.id)}>
                    Đổi ngay
                  </button>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                <p className="text-muted">Chưa có Voucher nào sẵn sàng.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
