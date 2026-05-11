import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { AuthContext } from '../context/authContextValue';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { register, userInfo } = useContext(AuthContext);

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(''); // Reset error

    // Regex chuẩn Unicode (Hỗ trợ tiếng Việt có dấu)
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

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
      return;
    }
    
    const result = await register(name, email, password);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <Row className="justify-content-md-center mt-5">
      <Col xs={12} md={6}>
        <Card className="shadow-sm border-0 p-4 rounded-4 bg-white">
          <h2 className="text-center text-brand-red fw-bold mb-4">ĐĂNG KÝ TÀI KHOẢN</h2>
          
          {error && <div className="alert alert-danger">{error}</div>}

          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label className="fw-semibold text-muted small text-uppercase">Họ và Tên</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên của bạn..."
                className="border-0 bg-light rounded-pill px-4 py-2 shadow-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label className="fw-semibold text-muted small text-uppercase">Địa chỉ Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Nhập email..."
                className="border-0 bg-light rounded-pill px-4 py-2 shadow-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label className="fw-semibold text-muted small text-uppercase">Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập mật khẩu..."
                className="border-0 bg-light rounded-pill px-4 py-2 shadow-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="confirmPassword">
              <Form.Label className="fw-semibold text-muted small text-uppercase">Xác nhận Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập lại mật khẩu..."
                className="border-0 bg-light rounded-pill px-4 py-2 shadow-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>

            <Button type="submit" variant="danger" className="w-100 buy-btn rounded-pill py-2 fw-bold shadow-sm">
              Tạo tài khoản
            </Button>
          </Form>

          <Row className="py-3">
            <Col className="text-center">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-brand-red fw-bold text-decoration-none">
                Đăng nhập
              </Link>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default RegisterScreen;
