import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Row, Col, Card, ListGroup, Image, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaTruck, FaCheckCircle, FaMapMarkerAlt, FaUserEdit } from 'react-icons/fa';
import axios from 'axios';
import { CartContext } from '../context/cartContextDef';
import { AuthContext } from '../context/authContextValue';

const CheckoutScreen = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Flag ngăn useEffect redirect về /cart sau khi đặt hàng xong
  const orderPlacedRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State mã giảm giá
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountAmount, discountType, discountValue }
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Redirect nếu chưa đăng nhập hoặc giỏ trống
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else if (cartItems.length === 0 && !orderPlacedRef.current) {
      // Chỉ redirect về giỏ hàng nếu chưa đặt hàng (tránh race condition khi clearCart() được gọi)
      navigate('/cart');
    } else if (cartItems.length > 0) {
      fetchAddresses();
    }
    // eslint-disable-next-line
  }, [userInfo, cartItems, navigate]);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/addresses', config);
      setAddresses(data);
      // Auto select default address
      const defaultAddr = data.find((addr) => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
      } else if (data.length > 0) {
        setSelectedAddressId(data[0]._id);
      }
    } catch (err) {
      setError('Không thể tải danh sách địa chỉ giao hàng.');
      console.error(err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Tổng tiền gốc (chưa giảm)
  const originalTotal = cartItems.reduce((acc, item) => acc + item.price * (item.qty || 1), 0);
  // Tổng tiền sau khi áp mã giảm giá
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalPrice = originalTotal - discountAmount;

  // Hàm áp mã giảm giá
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    setAppliedCoupon(null);
    setCouponLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post('/api/coupons/apply', { code: couponCode, orderTotal: originalTotal }, config);
      setAppliedCoupon(data);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Mã giảm giá không hợp lệ.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Xử lý Đặt hàng
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedAddressId) {
      setError('Vui lòng chọn một địa chỉ giao hàng!');
      return;
    }

    const selectedAddr = addresses.find((a) => a._id === selectedAddressId);
    if (!selectedAddr) return;

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
          color: item.color || null,
          storageLabel: item.storageLabel || null,
        })),
        shippingAddress: { 
          address: selectedAddr.address, 
          city: selectedAddr.city, 
          phone: selectedAddr.phone 
        },
        paymentMethod,
        totalPrice,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discountAmount: appliedCoupon ? appliedCoupon.discountAmount : 0,
      };

      const { data: createdOrder } = await axios.post('/api/orders', orderData, config);

      // Đánh dấu đã đặt hàng TRƯỚC khi clearCart() để useEffect không redirect về /cart
      orderPlacedRef.current = true;
      clearCart();

      if (paymentMethod === 'VNPay') {
        // Gọi API tạo link VNPay
        const { data: vnPayData } = await axios.post('/api/payment/vnpay', { orderId: createdOrder._id }, config);
        if (vnPayData.payUrl) {
          window.location.assign(vnPayData.payUrl);
          return;
        }
      }

      // Nếu là COD → chuyển trang đơn hàng
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

  if (!userInfo || cartItems.length === 0) return null;

  return (
    <div className="checkout-page py-3">
      <h3 className="mb-4 ps-2 border-start border-danger border-4 fw-bold">
        <FaTruck className="me-2" />Thanh toán
      </h3>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-4">
        {/* Cột trái: Form nhập địa chỉ */}
        <Col md={7}>
          <Card className="border-0 shadow-sm p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Địa chỉ giao hàng</h5>
                <Link to="/profile" className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1">
                    <FaUserEdit /> Thêm / Sửa địa chỉ
                </Link>
            </div>

            {loadingAddresses ? (
                <div className="text-center py-4"><Spinner animation="border" variant="danger" /></div>
            ) : addresses.length === 0 ? (
                <Alert variant="warning">
                    Bạn chưa có địa chỉ giao hàng nào. Vui lòng thêm địa chỉ trước khi thanh toán.
                </Alert>
            ) : (
                <Form onSubmit={handlePlaceOrder}>
                    <div className="address-selection mb-4">
                        {addresses.map((addr) => (
                            <label 
                                key={addr._id} 
                                className={`d-block p-3 mb-2 border rounded cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-danger bg-danger-subtle' : 'border-light-subtle'}`}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex align-items-start gap-3">
                                    <Form.Check 
                                        type="radio" 
                                        name="addressRadio" 
                                        id={`addr-${addr._id}`}
                                        className="mt-1"
                                        checked={selectedAddressId === addr._id}
                                        onChange={() => setSelectedAddressId(addr._id)}
                                    />
                                    <div>
                                        <div className="mb-1">
                                            <span className="fw-bold fs-6">{addr.recipientName}</span>
                                            <span className="mx-2 text-muted">|</span>
                                            <span className="fw-semibold text-muted">{addr.phone}</span>
                                            {addr.isDefault && <span className="badge bg-danger ms-2">Mặc định</span>}
                                        </div>
                                        <div className="text-secondary small">
                                            <FaMapMarkerAlt className="me-1" />
                                            {addr.address}, {addr.city}
                                        </div>
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>

                    <h5 className="fw-bold mb-3 mt-4">Phương thức thanh toán</h5>
                    <div className="payment-selection mb-4">
                      <label className={`d-block p-3 mb-2 border rounded cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-danger bg-danger-subtle' : 'border-light-subtle'}`} style={{ cursor: 'pointer' }}>
                        <div className="d-flex align-items-center gap-3">
                          <Form.Check 
                            type="radio" 
                            name="paymentRadio" 
                            checked={paymentMethod === 'COD'}
                            onChange={() => setPaymentMethod('COD')}
                          />
                          <div>
                            <span className="fw-bold">Thanh toán khi nhận hàng (COD)</span>
                            <div className="text-secondary small">Thanh toán bằng tiền mặt khi giao hàng</div>
                          </div>
                        </div>
                      </label>
                      <label className={`d-block p-3 mb-2 border rounded cursor-pointer transition-all ${paymentMethod === 'VNPay' ? 'border-danger bg-danger-subtle' : 'border-light-subtle'}`} style={{ cursor: 'pointer' }}>
                        <div className="d-flex align-items-center gap-3">
                          <Form.Check 
                            type="radio" 
                            name="paymentRadio" 
                            checked={paymentMethod === 'VNPay'}
                            onChange={() => setPaymentMethod('VNPay')}
                          />
                          <div>
                            <span className="fw-bold">Thanh toán qua VNPay</span>
                            <div className="text-secondary small">Thẻ ATM, Thẻ tín dụng / ghi nợ quốc tế</div>
                          </div>
                        </div>
                        {paymentMethod === 'VNPay' && import.meta.env.MODE === 'development' && (
                          <div className="mt-3 p-2 bg-white border border-warning rounded small text-secondary">
                            <strong className="text-warning">Gợi ý test (Sandbox):</strong> <br/>
                            Số thẻ: <span className="user-select-all fw-bold text-dark">9704198526191432198</span><br/>
                            Tên: <span className="user-select-all fw-bold text-dark">NGUYEN VAN A</span><br/>
                            Ngày: <span className="user-select-all fw-bold text-dark">07/15</span> | OTP: <span className="user-select-all fw-bold text-dark">123456</span>
                          </div>
                        )}
                      </label>
                    </div>

                    <Button
                        type="submit"
                        variant="danger"
                        className="buy-btn w-100 py-2 fs-5 d-flex align-items-center justify-content-center gap-2"
                        disabled={loading || addresses.length === 0 || !selectedAddressId}
                    >
                        {loading ? (
                        <Spinner animation="border" size="sm" />
                        ) : (
                        <FaCheckCircle />
                        )}
                        Xác nhận Đặt hàng
                    </Button>
                </Form>
            )}
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
                    <Col xs={3} md={2}>
                      <Image src={item.image} alt={item.name} fluid rounded />
                    </Col>
                    <Col xs={5} md={6}>
                      <span className="small fw-semibold">{item.name}</span>
                      {(item.color || item.storageLabel) && (
                        <div className="text-muted" style={{ fontSize: '11px' }}>
                          {item.color && <span>Màu: {item.color}</span>}
                          {item.color && item.storageLabel && <span className="mx-1">|</span>}
                          {item.storageLabel && <span>Bản: {item.storageLabel}</span>}
                        </div>
                      )}
                      <small className="text-muted">SL: {item.qty || 1}</small>
                    </Col>
                    <Col xs={4} className="text-end text-danger fw-bold small">
                      {(item.price * (item.qty || 1)).toLocaleString('vi-VN')} đ
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}

              {/* Ô nhập mã giảm giá */}
              <ListGroup.Item className="py-3">
                <div className="small fw-bold mb-2">Mã giảm giá</div>
                {appliedCoupon ? (
                  <div className="d-flex align-items-center justify-content-between p-2 bg-success-subtle border border-success rounded">
                    <div>
                      <span className="badge bg-success me-2">{appliedCoupon.code}</span>
                      <span className="text-success small fw-semibold">
                        Giảm {appliedCoupon.discountType === 'percentage' 
                          ? `${appliedCoupon.discountValue}%` 
                          : `${appliedCoupon.discountValue.toLocaleString('vi-VN')}đ`}
                      </span>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger py-0"
                      onClick={handleRemoveCoupon}
                      style={{ fontSize: '12px' }}
                    >✕ Bỏ</button>
                  </div>
                ) : (
                  <>
                    <div className="d-flex gap-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Nhập mã..."
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      />
                      <button
                        className="btn btn-sm btn-outline-danger px-3"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                      >
                        {couponLoading ? '...' : 'Áp dụng'}
                      </button>
                    </div>
                    {couponError && (
                      <div className="text-danger small mt-1">{couponError}</div>
                    )}
                  </>
                )}
              </ListGroup.Item>

              {/* Tổng tiền */}
              <ListGroup.Item className="py-3">
                {appliedCoupon ? (
                  <>
                    <div className="d-flex justify-content-between text-muted small mb-1">
                      <span>Tổng tiền hàng:</span>
                      <span>{originalTotal.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="d-flex justify-content-between text-success small mb-2 fw-semibold">
                      <span>Giảm giá ({appliedCoupon.code}):</span>
                      <span>- {discountAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <hr className="my-1" />
                  </>
                ) : null}
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold fs-5">Thành tiền:</span>
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
