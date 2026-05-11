import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Badge, ListGroup, Spinner, Alert, Image, Button } from 'react-bootstrap';
import { FaBox, FaArrowLeft, FaMapMarkerAlt, FaCreditCard, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import { AuthContext } from '../context/authContextValue';
import { toast } from 'react-toastify';
import { optimizeCloudinaryUrl } from '../utils/imageUtils';

const OrderDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    const fetchOrder = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`/api/orders/${id}`, config);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không tìm thấy đơn hàng!');
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id, userInfo, navigate]);

  // Màu badge theo trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Chờ xử lý': return 'warning';
      case 'Đã chuyển cho đơn vị vận chuyển': return 'info';
      case 'Đang giao': return 'primary';
      case 'Đã giao thành công': return 'success';
      case 'Đã hủy': return 'danger';
      default: return 'secondary';
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này không?')) return;
    setCancelling(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`/api/orders/${id}/cancel`, {}, config);
      toast.success('Đã hủy đơn hàng thành công!');
      // Reload lại đơn hàng
      const { data } = await axios.get(`/api/orders/${id}`, config);
      setOrder(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng!');
    }
    setCancelling(false);
  };

  const handleVNPayRetry = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post('/api/payment/vnpay', { orderId: id }, config);
      if (data.payUrl) window.location.assign(data.payUrl);
    } catch {
      toast.error('Không thể tạo lại giao dịch thanh toán.');
    }
  };

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="danger" />
      <p className="mt-2 text-muted">Đang tải đơn hàng...</p>
    </div>
  );

  if (error) return (
    <>
      <Link className="btn btn-light my-3 border shadow-sm d-inline-flex align-items-center gap-2" to="/orders">
        <FaArrowLeft /> Quay lại
      </Link>
      <Alert variant="danger" className="text-center">{error}</Alert>
    </>
  );

  const canCancel = order.status !== 'Đã hủy' && order.status !== 'Đã giao thành công' &&
    ((order.paymentMethod === 'COD' && order.status === 'Chờ xử lý') ||
     (order.paymentMethod === 'VNPay' && !order.isPaid));

  return (
    <div className="py-3">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <Link className="btn btn-light border shadow-sm d-inline-flex align-items-center gap-2 rounded-pill px-4 py-2 fw-bold" to="/orders">
          <FaArrowLeft /> Quay lại danh sách đơn hàng
        </Link>
        <Badge bg={getStatusBadge(order.status)} className="px-4 py-2 fs-6 rounded-pill shadow-sm">
          {order.status}
        </Badge>
      </div>

      <h4 className="mb-4 ps-2 border-start border-danger border-4 fw-bold">
        <FaBox className="me-2 text-danger" />
        Chi tiết đơn hàng #{order._id.slice(-8).toUpperCase()}
      </h4>

      <Row className="g-3">
        {/* CỘT TRÁI: Danh sách sản phẩm */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
            <Card.Header className="bg-light border-0 fw-bold py-3 px-4">
              Sản phẩm đã đặt ({order.orderItems.length} loại)
            </Card.Header>
            <ListGroup variant="flush" className="px-2">
              {order.orderItems.map((item, idx) => (
                <ListGroup.Item key={idx} className="py-3 border-0 border-bottom">
                  <div className="d-flex gap-3 align-items-start">
                    {/* Ảnh sản phẩm */}
                    <div style={{ width: '70px', flexShrink: 0 }}>
                      <Image
                        src={optimizeCloudinaryUrl(item.image, 100, 100)}
                        alt={item.name}
                        fluid rounded
                      />
                    </div>

                    {/* Thông tin sản phẩm */}
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap flex-md-nowrap">
                        <Link 
                          to={`/product/${item.product}`} 
                          className="text-dark text-decoration-none fw-semibold text-truncate-2"
                          style={{ fontSize: '14px', lineHeight: '1.4' }}
                        >
                          {item.name}
                        </Link>
                        <div className="text-end">
                          <div className="text-danger fw-bold text-nowrap" style={{ fontSize: '15px' }}>
                            {(item.price * item.qty).toLocaleString('vi-VN')} đ
                          </div>
                          <div className="text-muted small">x{item.qty}</div>
                        </div>
                      </div>
                      
                      {(item.color || item.storageLabel) && (
                        <div className="mt-1 d-flex flex-wrap gap-2">
                          {item.color && <Badge bg="light" text="dark" className="fw-normal border">Màu: {item.color}</Badge>}
                          {item.storageLabel && <Badge bg="light" text="dark" className="fw-normal border">{item.storageLabel}</Badge>}
                        </div>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          {/* Địa chỉ giao hàng */}
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <Card.Header className="bg-light border-0 fw-bold py-3 px-4">
              <FaMapMarkerAlt className="me-2 text-danger" />
              Địa chỉ giao hàng
            </Card.Header>
            <Card.Body className="px-4 pb-4 pt-3">
              <p className="mb-2"><strong>Người nhận:</strong> {order.shippingAddress.fullName || userInfo.name}</p>
              <p className="mb-2"><strong>Số điện thoại:</strong> {order.shippingAddress.phone}</p>
              <p className="mb-0"><strong>Địa chỉ:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}</p>
            </Card.Body>
          </Card>
        </Col>

        {/* CỘT PHẢI: Tóm tắt & hành động */}
        <Col lg={4}>
          {/* Thông tin thanh toán */}
          {/* Thông tin thanh toán */}
          <Card className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
            <Card.Header className="bg-light border-0 fw-bold py-3 px-4">
              <FaCreditCard className="me-2 text-danger" />
              Thanh toán
            </Card.Header>
            <ListGroup variant="flush" className="px-2">
              <ListGroup.Item className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span className="text-muted">Phương thức:</span>
                <span className="fw-semibold">{order.paymentMethod}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span className="text-muted">Trạng thái:</span>
                {order.isPaid ? (
                  <span className="text-success fw-bold d-flex align-items-center gap-1">
                    <FaCheckCircle /> Đã thanh toán
                  </span>
                ) : (
                  <span className="text-danger fw-bold d-flex align-items-center gap-1">
                    <FaTimesCircle /> Chưa thanh toán
                  </span>
                )}
              </ListGroup.Item>
              {order.discountAmount > 0 && (
                <ListGroup.Item className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <span className="text-muted">Giảm giá (mã {order.couponCode}):</span>
                  <span className="text-success fw-semibold text-nowrap">- {order.discountAmount.toLocaleString('vi-VN')} đ</span>
                </ListGroup.Item>
              )}
              <ListGroup.Item className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span className="fw-bold">Tổng tiền:</span>
                <span className="text-danger fw-bold fs-5 text-nowrap">{order.totalPrice.toLocaleString('vi-VN')} đ</span>
              </ListGroup.Item>
            </ListGroup>
          </Card>

          {/* Thời gian đặt hàng */}
          {/* Thời gian đặt hàng */}
          <Card className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
            <Card.Body className="px-4 py-3 small text-muted bg-light border-0">
              <div>Đặt lúc: <strong className="text-dark">{new Date(order.createdAt).toLocaleString('vi-VN')}</strong></div>
              {order.isPaid && order.paidAt && (
                <div className="mt-1">Thanh toán lúc: <strong className="text-dark">{new Date(order.paidAt).toLocaleString('vi-VN')}</strong></div>
              )}
            </Card.Body>
          </Card>

          {/* Nút hành động */}
          {!order.isPaid && order.paymentMethod === 'VNPay' && order.status !== 'Đã hủy' && (
            <Button variant="danger" className="w-100 mb-3 rounded-pill py-2 fw-bold shadow-sm" onClick={handleVNPayRetry}>
              Thanh toán lại qua VNPay
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline-danger"
              className="w-100 rounded-pill py-2 fw-bold shadow-sm border-2"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
            </Button>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default OrderDetailScreen;
