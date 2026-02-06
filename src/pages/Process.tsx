import { useEffect } from 'react';
import { getAssetPath } from '../utils/assets';
import { processSteps } from '../data/process';

export default function Process() {
  useEffect(() => {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const cards = document.querySelectorAll('.process-card');
    cards.forEach((card, index) => {
      // Add stagger delay
      (card as HTMLElement).style.transitionDelay = `${index * 0.1}s`;
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

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
                <article className="process-card fade-in" key={step.id}>
                  <div className="process-number">{String(index + 1).padStart(2, '0')}</div>
                  <div className="process-image">
                    <img src={getAssetPath(step.image)} alt={step.title} loading="lazy" />
                  </div>
                  <div className="process-content">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                  <div className="process-dot"></div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
