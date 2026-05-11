import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaYoutube, FaTiktok } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-5 border-top border-4 border-danger">
      <Container>
        <Row className="g-4">
          <Col md={4}>
            <h5 className="fw-bold mb-3 text-danger">NDC SHOP</h5>
            <p className="text-white-50 small mb-2 d-flex align-items-center gap-2">
              <FaMapMarkerAlt className="text-danger" /> 70 ngõ 176 Trương Định, Hai Bà Trưng, Hà Nội
            </p>
            <p className="text-white-50 small mb-2 d-flex align-items-center gap-2">
              <FaPhoneAlt className="text-danger" /> 0973 521 509
            </p>
            <p className="text-white-50 small mb-0 d-flex align-items-center gap-2">
              <FaEnvelope className="text-danger" /> ndcshop@gmail.com
            </p>
          </Col>

          <Col md={4}>
            <h6 className="fw-bold mb-3">Chính sách</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><Link to="/about" className="text-white-50 text-decoration-none footer-link">Giới thiệu về NDC Shop</Link></li>
              <li className="mb-2"><Link to="/contact" className="text-white-50 text-decoration-none footer-link">Chính sách bảo hành</Link></li>
              <li className="mb-2"><Link to="/contact" className="text-white-50 text-decoration-none footer-link">Chính sách đổi trả</Link></li>
              <li className="mb-2"><Link to="/contact" className="text-white-50 text-decoration-none footer-link">Chính sách vận chuyển</Link></li>
            </ul>
          </Col>

          <Col md={4}>
            <h6 className="fw-bold mb-3">Kết nối với chúng tôi</h6>
            <div className="d-flex gap-2 mb-3">
              <a href="#" className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }} aria-label="Facebook"><FaFacebookF size={18} /></a>
              <a href="#" className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }} aria-label="YouTube"><FaYoutube size={18} /></a>
              <a href="#" className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }} aria-label="TikTok"><FaTiktok size={18} /></a>
            </div>
            <p className="text-white-50 small mb-0">Theo dõi chúng tôi để cập nhật khuyến mãi mới nhất!</p>
          </Col>
        </Row>

        <hr className="border-secondary mt-4 mb-3" />
        <p className="text-center text-white-50 small mb-0">
          NDC Shop &copy; {currentYear} — Chuyên điện thoại chính hãng
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
