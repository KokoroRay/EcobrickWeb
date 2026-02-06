import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', phone: '', email: '', message: '' });

      // Reset success message after 3s
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="page content">
      <section className="section pad">
        <div className="container contact-grid">
          <div className="contact-left">
            <h1 style={{ fontSize: '2.5rem', color: '#20803F', marginBottom: '1.5rem', fontWeight: 700 }}>ECOBRICK</h1>
            <p style={{ marginBottom: '1rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với Ecobrick để cùng xây dựng tương lai xanh và bền vững!
            </p>

            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ color: '#20803F', fontSize: '1.5rem', marginTop: '0.2rem' }}>📍</div>
                <div>
                  <h4 style={{ color: '#20803F', marginBottom: '0.25rem', fontSize: '1.1rem', fontWeight: 600 }}>Địa chỉ</h4>
                  <p style={{ color: '#555', lineHeight: 1.6 }}>Nguyễn Văn Cừ, Ninh Kiều, TP Cần Thơ</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ color: '#20803F', fontSize: '1.5rem', marginTop: '0.2rem' }}>📞</div>
                <div>
                  <h4 style={{ color: '#20803F', marginBottom: '0.25rem', fontSize: '1.1rem', fontWeight: 600 }}>Điện thoại</h4>
                  <p style={{ color: '#555', lineHeight: 1.6 }}>0909 123 456</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ color: '#20803F', fontSize: '1.5rem', marginTop: '0.2rem' }}>📧</div>
                <div>
                  <h4 style={{ color: '#20803F', marginBottom: '0.25rem', fontSize: '1.1rem', fontWeight: 600 }}>Email</h4>
                  <p style={{ color: '#555', lineHeight: 1.6 }}>ecobrick.vn@gmail.com</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ color: '#20803F', fontSize: '1.5rem', marginTop: '0.2rem' }}>🕒</div>
                <div>
                  <h4 style={{ color: '#20803F', marginBottom: '0.25rem', fontSize: '1.1rem', fontWeight: 600 }}>Giờ làm việc</h4>
                  <p style={{ color: '#555', lineHeight: 1.6 }}>8:00 - 17:00 (Thứ 2 - Thứ 7)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-right">
            <form className="contact-form" onSubmit={handleSubmit}>
              <h2
                style={{
                  textAlign: 'center',
                  color: '#20803F',
                  fontSize: '2.2rem',
                  margin: '0 0 1.5rem',
                  fontWeight: 700,
                  width: '100%',
                }}
              >
                LIÊN HỆ
              </h2>

              <input
                type="text"
                name="name"
                placeholder="Họ tên *"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  border: '1.5px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                }}
              />

              <input
                type="tel"
                name="phone"
                placeholder="Số điện thoại *"
                value={formData.phone}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  border: '1.5px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                }}
              />

              <input
                type="email"
                name="email"
                placeholder="Địa chỉ email *"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  border: '1.5px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                }}
              />

              <textarea
                name="message"
                rows={5}
                placeholder="Nội dung *"
                value={formData.message}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  border: '1.5px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  resize: 'vertical',
                  transition: 'all 0.3s ease',
                }}
              />

              {submitStatus === 'success' && (
                <div
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(32, 128, 63, 0.1)',
                    color: '#20803F',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  ✓ Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.
                </div>
              )}

              <button
                className="btn primary"
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: isSubmitting ? '#ccc' : '#20803F',
                  color: '#ffffff',
                  border: 'none',
                  padding: '1rem',
                  textAlign: 'center',
                  width: '100%',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                {isSubmitting ? 'ĐANG GỬI...' : 'GỬI LIÊN HỆ'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
