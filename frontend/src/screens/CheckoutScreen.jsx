import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, ListGroup, Image, Form, Button, Spinner } from 'react-bootstrap';
import { FaTruck, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import { CartContext } from '../context/cartContextDef';
import { AuthContext } from '../context/authContextValue';

const CheckoutScreen = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);

  // Form nhập địa chỉ giao hàng
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState(userInfo?.phone || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect nếu chưa đăng nhập
  if (!userInfo) {
    navigate('/login');
    return null;
  }

  // Redirect nếu giỏ trống
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  // Tổng tiền
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * (item.qty || 1), 0);

  // Xử lý Đặt hàng
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!address || !city || !phone) {
      setError('Vui lòng nhập đầy đủ thông tin giao hàng!');
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // Chuẩn bị dữ liệu đơn hàng
      const orderData = {
        orderItems: cartItems.map((item) => ({
          name: item.name,
          qty: item.qty || 1,
          image: item.image,
          price: item.price,
          product: item._id,
        })),
        shippingAddress: { address, city, phone },
        totalPrice,
      };

      await axios.post('/api/orders', orderData, config);

      // Thành công → xóa giỏ hàng và chuyển sang trang đơn hàng
      clearCart();
      navigate('/orders?success=true');
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Đã có lỗi xảy ra khi đặt hàng!'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page py-3">
      <h3 className="mb-4 ps-2 border-start border-danger border-4 fw-bold">
        <FaTruck className="me-2" />Thanh toán
      </h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <Row className="g-4">
        {/* Cột trái: Form nhập địa chỉ */}
        <Col md={7}>
          <Card className="border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-4">Thông tin giao hàng</h5>
            <Form onSubmit={handlePlaceOrder}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Họ và tên người nhận</Form.Label>
                <Form.Control
                  type="text"
                  value={userInfo.name}
                  disabled
                  className="bg-light"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Số điện thoại</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="Nhập số điện thoại..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Địa chỉ giao hàng</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Số nhà, đường, phường/xã..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Tỉnh / Thành phố</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="VD: Hà Nội, TP.HCM..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                variant="danger"
                className="buy-btn w-100 py-2 fs-5 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <FaCheckCircle />
                )}
                Xác nhận Đặt hàng
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Cột phải: Tóm tắt đơn hàng */}
        <Col md={5}>
          <Card className="border-0 shadow-sm">
            <ListGroup variant="flush">
              <ListGroup.Item className="bg-light">
                <h5 className="mb-0 fw-bold">Đơn hàng của bạn</h5>
              </ListGroup.Item>

              {cartItems.map((item) => (
                <ListGroup.Item key={item._id} className="py-3">
                  <Row className="align-items-center">
                    <Col xs={2}>
                      <Image src={item.image} alt={item.name} fluid rounded />
                    </Col>
                    <Col xs={6}>
                      <span className="small fw-semibold">{item.name}</span>
                      <br />
                      <small className="text-muted">SL: {item.qty || 1}</small>
                    </Col>
                    <Col xs={4} className="text-end text-danger fw-bold small">
                      {(item.price * (item.qty || 1)).toLocaleString('vi-VN')} đ
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}

              <ListGroup.Item className="py-3">
                <div className="d-flex justify-content-between">
                  <span className="fw-bold fs-5">Tổng cộng:</span>
                  <span className="text-danger fw-bold fs-4">
                    {totalPrice.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CheckoutScreen;
