import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { AuthContext } from '../context/authContextValue';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  // Lấy hàm Đăng nhập và kiểm tra xem có ai đang đăng nhập không
  const { login, userInfo } = useContext(AuthContext);

  // Nếu trong Kho đã có User rồi (đã đăng nhập) thì tự động đá văng về Trang phù hợp
  useEffect(() => {
    if (userInfo) {
      if (userInfo.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Địa chỉ email không hợp lệ!');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu!');
      return;
    }

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <Row className="justify-content-md-center align-items-center mt-5">
      <Col xs={12} md={6}>
        <Card className="shadow-sm border-0 p-4 rounded-4 bg-white">
          <h2 className="text-center text-brand-red fw-bold mb-4">ĐĂNG NHẬP</h2>
          
          {error && <div className="alert alert-danger">{error}</div>}

          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label className="fw-semibold text-muted small text-uppercase">Địa chỉ Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Nhập email của bạn..."
                className="border-0 bg-light rounded-pill px-4 py-2 shadow-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label className="fw-semibold text-muted small text-uppercase">Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập mật khẩu..."
                className="border-0 bg-light rounded-pill px-4 py-2 shadow-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button type="submit" variant="danger" className="w-100 buy-btn rounded-pill py-2 fw-bold shadow-sm">
              Đăng Nhập
            </Button>
          </Form>

          <Row className="py-3">
            <Col className="text-center">
              Khách hàng mới?{' '}
              <Link to="/register" className="text-brand-red fw-bold text-decoration-none">
                Đăng ký ngay
              </Link>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginScreen;
