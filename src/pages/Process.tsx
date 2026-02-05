import { processSteps } from '../data/process';

export default function Process() {
  return (
    <div className="page content">
      <section className="process-page">
        <div className="container">
          <div className="process-section">
        <h1 className="process-title">QUY TRÌNH SẢN XUẤT</h1>
        <p className="process-subtitle">
          Từ rác thải nhựa đến vật liệu xây dựng bền vững – Hành trình tái chế xanh của Ecobrick
        </p>

        <div className="process-grid">
          {processSteps.map((step, index) => (
            <article className="process-card" key={step.id}>
              <div className="process-number">{String(index + 1).padStart(2, '0')}</div>
              <div className="process-image">
                <img src={step.image} alt={step.title} />
              </div>
              <div className="process-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
