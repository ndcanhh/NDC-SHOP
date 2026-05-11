import React, { useState } from 'react';
import { Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';

const contacts = [
  { icon: <FaPhone className="text-danger" size={20} />, label: 'Hotline', value: '0973 521 509', note: 'Hỗ trợ 8:00 – 22:00 hàng ngày' },
  { icon: <FaEnvelope className="text-danger" size={20} />, label: 'Email', value: 'ndcshop@gmail.com', note: 'Phản hồi trong vòng 24h' },
  { icon: <FaMapMarkerAlt className="text-danger" size={20} />, label: 'Địa chỉ', value: '70 ngõ 176 Trương Định, Hai Bà Trưng, Hà Nội', note: '' },
  { icon: <FaClock className="text-danger" size={20} />, label: 'Giờ làm việc', value: 'Thứ 2 – Chủ nhật: 8:00 – 22:00', note: 'Kể cả ngày lễ' },
];

const ContactScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Regex chuẩn Unicode
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[\p{L}\s]+$/u;

    if (!name.trim() || !nameRegex.test(name)) {
      setError('Họ và tên không hợp lệ (Không chứa số hoặc ký tự đặc biệt)!');
      return;
    }

    if (!emailRegex.test(email)) {
      setError('Địa chỉ email không hợp lệ!');
      return;
    }

    if (message.trim().length < 10) {
      setError('Nội dung tin nhắn quá ngắn (tối thiểu 10 ký tự)!');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/contacts', { name, email, message });
      setSent(true);
      setName(''); setEmail(''); setMessage('');
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Đã có lỗi xảy ra, vui lòng thử lại!'
      );
    }
    setLoading(false);
  };

  return (
    <div className="contact-page py-4">
      <h3 className="mb-4 ps-2 border-start border-danger border-4 fw-bold">
        Liên hệ với chúng tôi
      </h3>

      <Row className="g-4">
        {/* Cột trái: Thông tin liên hệ */}
        <Col md={5}>
          <div className="d-flex flex-column gap-3">
            {contacts.map((c, i) => (
              <Card key={i} className="border-0 shadow-sm p-3 rounded-4 bg-white">
                <div className="d-flex align-items-start gap-3">
                  <div className="mt-1">{c.icon}</div>
                  <div>
                    <div className="text-muted small mb-1">{c.label}</div>
                    <div className="fw-semibold">{c.value}</div>
                    {c.note && <div className="text-muted small">{c.note}</div>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Col>

        {/* Cột phải: Form gửi tin nhắn */}
        <Col md={7}>
          <Card className="border-0 shadow-sm p-4 rounded-4 bg-white">
            <h5 className="fw-bold mb-4">Gửi tin nhắn cho chúng tôi</h5>

            {sent && (
              <div className="alert alert-success py-2">
                Tin nhắn đã được gửi! Chúng tôi sẽ liên hệ lại sớm nhất.
              </div>
            )}

            {error && (
              <div className="alert alert-danger py-2">{error}</div>
            )}

            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-muted small text-uppercase">Họ và tên</Form.Label>
                    <Form.Control
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập họ và tên..."
                      className="border-0 bg-light rounded-pill px-4 py-2 shadow-none"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-muted small text-uppercase">Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập email..."
                      className="border-0 bg-light rounded-pill px-4 py-2 shadow-none"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-muted small text-uppercase">Nội dung tin nhắn</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Bạn cần hỗ trợ về sản phẩm nào?..."
                      className="border-0 bg-light rounded-4 px-4 py-3 shadow-none"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button type="submit" variant="danger" className="mt-3 buy-btn d-flex align-items-center gap-2 px-4 rounded-pill py-2 fw-bold shadow-sm" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : <FaPaperPlane />}
                {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ContactScreen;
