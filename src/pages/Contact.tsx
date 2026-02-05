export default function Contact() {
  return (
    <div className="page content">
      <section className="section pad">
        <div className="container contact-grid">
          <div className="contact-left">
            <h1 style={{ fontSize: '2rem', color: '#20803F', marginBottom: '1rem' }}>ECOBRICK</h1>
            <p>Địa chỉ: Nguyễn Văn Cừ, Ninh Kiều, TP Cần Thơ</p>
            <p>Điện thoại: 0909 123 456</p>
            <p>Email: ecobrick.vn@gmail.com</p>
          </div>

          <div className="contact-right">
            <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
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
              <input type="text" placeholder="Họ tên" />
              <input type="text" placeholder="Số điện thoại" />
              <input type="email" placeholder="Địa chỉ email" />
              <textarea rows={5} placeholder="Nội dung"></textarea>
              <button className="btn primary" type="submit">
                GỬI LIÊN HỆ
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
