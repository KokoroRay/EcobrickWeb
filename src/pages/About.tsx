export default function About() {
  return (
    <section className="page content">
      <section className="about-section">
        <div className="about-container">
          <div className="about-text slide-left">
            <h2 className="section-title left">GIỚI THIỆU</h2>
            <p>
              <em>
                <strong>Ecobrick</strong> - Dự án Gạch tái chế từ rác nhựa mềm
              </em>
            </p>
            <p>
              <strong>Ecobrick</strong> là sáng kiến hướng tới giảm ô nhiễm nhựa bằng cách tận dụng các loại nhựa mềm khó tái chế
              (chai nhựa mỏng, túi nilon, màng bọc) đưa vào thành phần sản xuất gạch xây dựng. Mỗi viên gạch được thiết kế chứa
              khoảng 1% nhựa tái chế, vừa xử lý được rác thải nhựa, vừa duy trì độ bền cơ học của sản phẩm.
            </p>
          </div>
          <div className="about-image slide-right">
            <img src="/images/Banner.jpg" alt="Ecobrick intro" />
          </div>
        </div>
      </section>

      <section className="vision-section section-light">
        <div className="vision-container">
          <div className="vision-image slide-left">
            <img src="/images/EcoTerrazzo%20Panel.jpg" alt="Ecobrick vision" />
          </div>
          <div className="vision-text slide-right">
            <h2 className="section-title left">TẦM NHÌN</h2>
            <p>
              Trở thành doanh nghiệp tiên phong trong lĩnh vực vật liệu xây dựng xanh tại Việt Nam, góp phần giảm thiểu ô nhiễm nhựa
              và thúc đẩy lối sống bền vững. Ecobrick không chỉ tạo ra gạch tái chế mà còn nâng cao nhận thức cộng đồng về giá trị của
              tái chế và kinh tế tuần hoàn.
            </p>
          </div>
        </div>
      </section>

      <section className="mission-section">
        <div className="mission-container">
          <div className="mission-text slide-left">
            <h2 className="section-title left">SỨ MỆNH</h2>
            <p>
              Cung cấp giải pháp xây dựng bền vững, thân thiện với môi trường bằng cách biến rác thải nhựa mềm thành vật liệu hữu ích.
              Dự án hướng đến sản phẩm gạch bền, giá thành hợp lý và khuyến khích cộng đồng tham gia chuỗi tái chế.
            </p>
          </div>
          <div className="mission-image slide-right">
            <img src="/images/HDPE.jpg" alt="Ecobrick mission" />
          </div>
        </div>
      </section>
    </section>
  );
}
