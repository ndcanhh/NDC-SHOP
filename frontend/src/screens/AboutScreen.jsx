import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FaStore, FaTrophy, FaShieldAlt, FaHeadset, FaTruck, FaStar } from 'react-icons/fa';

const stats = [
  { icon: <FaStore size={28} />, value: '2020', label: 'Năm thành lập' },
  { icon: <FaStar size={28} />, value: '10.000+', label: 'Khách hàng hài lòng' },
  { icon: <FaTrophy size={28} />, value: '500+', label: 'Sản phẩm chính hãng' },
  { icon: <FaHeadset size={28} />, value: '24/7', label: 'Hỗ trợ khách hàng' },
];

const values = [
  { icon: <FaShieldAlt size={24} className="text-danger" />, title: 'Sản phẩm chính hãng 100%', desc: 'Toàn bộ điện thoại được nhập từ nhà phân phối ủy quyền chính thức tại Việt Nam.' },
  { icon: <FaTruck size={24} className="text-danger" />, title: 'Giao hàng toàn quốc', desc: 'Giao hàng nhanh 2-4 tiếng tại Hà Nội. Toàn quốc 1-3 ngày làm việc.' },
  { icon: <FaHeadset size={24} className="text-danger" />, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ tư vấn nhiệt tình, sẵn sàng hỗ trợ bạn mọi lúc qua điện thoại và chat.' },
  { icon: <FaTrophy size={24} className="text-danger" />, title: 'Bảo hành chính hãng', desc: 'Bảo hành theo chính sách hãng, hỗ trợ đổi trả trong 30 ngày nếu có lỗi do nhà sản xuất.' },
];

const AboutScreen = () => {
  return (
    <div className="about-page py-4">
      {/* Tiêu đề */}
      <h3 className="mb-4 ps-2 border-start border-danger border-4 fw-bold">
        Giới thiệu về NDC SHOP
      </h3>

      {/* Banner giới thiệu */}
      <Card className="border-0 shadow-sm mb-4 overflow-hidden">
        <div className="about-banner p-5 text-white text-center" style={{ background: 'linear-gradient(135deg, #d70018, #ff4d4d)' }}>
          <h2 className="fw-bold mb-2">NDC SHOP</h2>
          <p className="mb-0 fs-5">Chuyên điện thoại chính hãng — Uy tín là trên hết</p>
        </div>
      </Card>

      {/* Giới thiệu văn bản */}
      <Card className="border-0 shadow-sm p-4 mb-4">
        <h5 className="fw-bold text-danger mb-3">Câu chuyện của chúng tôi</h5>
        <p className="text-muted lh-lg">
          NDC SHOP được thành lập năm 2020 với sứ mệnh mang đến cho người dùng Việt Nam những chiếc điện thoại 
          chính hãng chất lượng cao với mức giá cạnh tranh nhất thị trường.
        </p>
        <p className="text-muted lh-lg">
          Chúng tôi tin rằng mỗi khách hàng xứng đáng được sở hữu một chiếc smartphone xịn — không phải 
          lo lắng về hàng giả, hàng kém chất lượng. Đây chính là lý do NDC SHOP ra đời.
        </p>
        <p className="text-muted lh-lg mb-0">
          Với đội ngũ nhân viên tư vấn chuyên nghiệp và hệ thống kho hàng hiện đại, chúng tôi tự hào phục vụ 
          hơn 10.000 khách hàng trên toàn quốc.
        </p>
      </Card>

      {/* Số liệu thống kê */}
      <Row className="g-3 mb-4">
        {stats.map((stat, i) => (
          <Col key={i} xs={6} md={3}>
            <Card className="border-0 shadow-sm text-center p-3 h-100">
              <div className="text-danger mb-2">{stat.icon}</div>
              <div className="fw-bold fs-4 text-danger">{stat.value}</div>
              <div className="text-muted small">{stat.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Giá trị cốt lõi */}
      <h5 className="fw-bold mb-3">Cam kết của chúng tôi</h5>
      <Row className="g-3">
        {values.map((v, i) => (
          <Col key={i} md={6}>
            <Card className="border-0 shadow-sm p-3 h-100">
              <div className="d-flex align-items-start gap-3">
                <div className="mt-1">{v.icon}</div>
                <div>
                  <div className="fw-bold mb-1">{v.title}</div>
                  <div className="text-muted small">{v.desc}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AboutScreen;
