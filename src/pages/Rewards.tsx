import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRewards } from '../context/RewardsContext';

export default function Rewards() {
  const { points, config, history, addDonation } = useRewards();
  const [kg, setKg] = useState(1);
  const [note, setNote] = useState('');

  const earned = kg * config.pointsPerKg;

  const handleSubmit = () => {
    addDonation(kg, note || 'Quyên góp nhựa tại điểm thu gom');
    setNote('');
    setKg(1);
  };

  return (
    <div className="page content">
      <section className="section pad">
        <div className="container">
        <div className="rewards-hero">
          <h1>Điểm thưởng Ecobrick</h1>
          <p>Quy đổi nhựa tái chế thành điểm thưởng để đổi voucher ưu đãi.</p>
          <div className="points-grid">
            <div className="points-card">
              <h3>Điểm hiện có</h3>
              <div className="points-value">{points} điểm</div>
              <p>Tích lũy từ hoạt động quyên góp nhựa.</p>
            </div>
            <div className="points-card">
              <h3>Quy đổi hiện tại</h3>
              <div className="points-value">1 kg = {config.pointsPerKg} điểm</div>
              <p>Admin có thể cập nhật quy đổi linh hoạt.</p>
            </div>
            <div className="points-card">
              <h3>Ưu đãi gần nhất</h3>
              <div className="points-value">100 điểm</div>
              <p>Đổi voucher giảm 5% khi mua gạch.</p>
            </div>
          </div>
        </div>

        <div className="rewards-actions">
          <div className="rewards-panel">
            <h2>Gửi thông tin quyên góp</h2>
            <div className="rewards-form">
              <label>
                Số kg nhựa
                <input
                  type="number"
                  min={1}
                  value={kg}
                  onChange={(event) => setKg(Number(event.target.value))}
                />
              </label>
              <label>
                Ghi chú
                <input
                  type="text"
                  placeholder="Ví dụ: Điểm thu gom KTX"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </label>
              <div className="chip-muted">Bạn sẽ nhận {earned} điểm</div>
              <button className="btn primary" type="button" onClick={handleSubmit}>
                Ghi nhận quyên góp
              </button>
            </div>
          </div>

          <div className="rewards-panel">
            <h2>Lịch sử tích điểm</h2>
            <div className="history-list">
              {history.slice(0, 5).map((entry) => (
                <div className="history-item" key={entry.id}>
                  <div>
                    <strong>{entry.note}</strong>
                    <div>{entry.createdAt}</div>
                  </div>
                  <div>{entry.points > 0 ? `+${entry.points}` : entry.points} điểm</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Link to="/redeem" className="btn outline">
                Đổi điểm ngay
              </Link>
            </div>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
