import { useState } from 'react';
import { useRewards } from '../context/RewardsContext';

export default function Redeem() {
  const { config, points, redeemOption } = useRewards();
  const [message, setMessage] = useState('');

  const handleRedeem = (id: string) => {
    const option = config.tiers.find((tier) => tier.id === id);
    if (!option) return;
    const result = redeemOption(option);
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
          {config.tiers.map((tier) => (
            <div className="voucher-card" key={tier.id}>
              <span className="badge">{tier.pointsRequired} điểm</span>
              <h3>{tier.title}</h3>
              <p>{tier.description}</p>
              <button className="btn primary" type="button" onClick={() => handleRedeem(tier.id)}>
                Đổi ngay
              </button>
            </div>
          ))}
        </div>
        </div>
      </section>
    </div>
  );
}
