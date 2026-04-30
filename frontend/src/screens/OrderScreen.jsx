import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { FaBox, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { AuthContext } from '../context/authContextValue';
import { toast } from 'react-toastify';

const OrderScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const justOrdered = searchParams.get('success') === 'true';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // VNPay trả về các param vnp_* trong URL sau khi thanh toán
  const vnpResponseCode = searchParams.get('vnp_ResponseCode');
  const vnpTxnRef = searchParams.get('vnp_TxnRef');

  const [refresh, setRefresh] = useState(false);

  const cancelOrderHandler = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không? Số lượng sản phẩm sẽ được hoàn trả vào kho.')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.put(`/api/orders/${id}/cancel`, {}, config);
        toast.success('Đã hủy đơn hàng thành công!');
        setRefresh(!refresh); // Tải lại danh sách
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      }
    }
  };

  // Redirect nếu chưa đăng nhập
  const handleVNPayRetry = async (orderId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post('/api/payment/vnpay', { orderId }, config);
      if (data.payUrl) {
        window.location.assign(data.payUrl);
      }
    } catch (error) {
      console.error('Lỗi khi thanh toán lại:', error);
      toast.error('Không thể tạo lại giao dịch thanh toán.');
    }
  };
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }



    const verifyVNPay = async () => {
      // 24 là mã Hủy giao dịch của VNPay, hoặc các mã lỗi khác không phải 00
      if (vnpResponseCode !== '00') {
        setPaymentError('Bạn đã hủy thanh toán hoặc giao dịch thất bại. Đơn hàng đã được lưu và đang chờ thanh toán.');
        return;
      }

      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        // Gửi toàn bộ vnp_* params lên BE để xác thực chữ ký (chỉ kiểm tra khi mã 00)
        const vnpParams = {};
        for (const [key, val] of searchParams.entries()) {
          vnpParams[key] = val;
        }
        await axios.post('/api/payment/vnpay-verify', vnpParams, config);
        setPaymentMessage('Thanh toán VNPay thành công! Đơn hàng đã được ghi nhận.');
      } catch (err) {
        console.error('VNPay verify error:', err);
        setPaymentError('Giao dịch VNPay không hợp lệ hoặc có lỗi xảy ra.');
      }
    };

    const fetchOrders = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        if (vnpResponseCode && vnpTxnRef) {
          await verifyVNPay();
        }

        const { data } = await axios.get('/api/orders/myorders', config);
        setOrders(data);
      } catch (error) {
        console.error('Lỗi khi tải đơn hàng:', error);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [userInfo, navigate, vnpResponseCode, vnpTxnRef, searchParams, refresh]);

  // Hiển thị màu badge theo trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Chờ xử lý': return 'warning';
      case 'Đã chuyển cho đơn vị vận chuyển': return 'info';
      case 'Đang giao': return 'info';
      case 'Đã giao thành công': return 'success';
      case 'Đã hủy': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="orders-page py-3">
      {/* Thông báo đặt hàng thành công (COD) */}
      {justOrdered && !vnpResponseCode && (
        <div className="alert alert-success d-flex align-items-center gap-2 shadow-sm border-0">
          <FaCheckCircle size={20} />
          <strong>Đặt hàng thành công!</strong> Cảm ơn bạn đã mua sắm tại NDC Shop.
        </div>
      )}

      {paymentMessage && (
        <div className="alert alert-success d-flex align-items-center gap-2 shadow-sm border-0">
          <FaCheckCircle size={20} />
          <strong>{paymentMessage}</strong>
        </div>
      )}

      {paymentError && (
        <div className="alert alert-danger d-flex align-items-center gap-2 shadow-sm border-0">
          <strong>⚠️ {paymentError}</strong> Vui lòng liên hệ bộ phận hỗ trợ nếu bạn đã bị trừ tiền.
        </div>
      )}

      <h3 className="mb-4 ps-2 border-start border-danger border-4 fw-bold">
        <FaBox className="me-2" />Đơn hàng của tôi
      </h3>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-2 text-muted">Đang tải đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-5">
          <FaBox size={50} className="text-muted mb-3" />
          <h5 className="text-muted">Bạn chưa có đơn hàng nào</h5>
          <Link to="/" className="btn btn-danger mt-3">Đi mua sắm ngay</Link>
        </div>
      ) : (
        <Row className="g-3">
          {orders.map((order) => (
            <Col key={order._id} xs={12}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-3">
                  <Row className="align-items-center">
                    {/* Mã đơn + ngày */}
                    <Col md={3}>
                      <small className="text-muted">Mã đơn hàng</small>
                      <div className="fw-bold small" style={{ wordBreak: 'break-all' }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </div>
                      <small className="text-muted">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </small>
                    </Col>

                    {/* Sản phẩm tóm tắt */}
                    <Col md={4}>
                      <small className="text-muted">Sản phẩm</small>
                      {order.orderItems.slice(0, 2).map((item, i) => (
                        <div key={i} className="small fw-semibold">
                          {item.name} 
                          {(item.color || item.storageLabel) && (
                            <span className="text-muted fw-normal" style={{ fontSize: '11px' }}>
                              {' '}({item.color}{item.color && item.storageLabel ? ', ' : ''}{item.storageLabel})
                            </span>
                          )}
                          <span className="text-muted"> x{item.qty}</span>
                        </div>
                      ))}
                      {order.orderItems.length > 2 && (
                        <small className="text-muted">
                          +{order.orderItems.length - 2} sản phẩm khác
                        </small>
                      )}
                    </Col>

                    {/* Tổng tiền */}
                    <Col md={2} className="text-center">
                      <small className="text-muted d-block">Tổng tiền</small>
                      <span className="text-danger fw-bold">
                        {order.totalPrice.toLocaleString('vi-VN')} đ
                      </span>
                    </Col>

                    {/* Trạng thái */}
                    <Col md={3} className="text-center d-flex flex-column gap-2 align-items-center">
                      <Badge bg={getStatusBadge(order.status)} className="px-3 py-2 w-100" style={{ maxWidth: '180px', fontSize: '12px', whiteSpace: 'normal' }}>
                        {order.status}
                      </Badge>
                      {order.paymentMethod === 'VNPay' && order.status !== 'Đã hủy' && (
                        <Badge bg={order.isPaid ? 'success' : 'secondary'} className="px-3 py-2 w-100" style={{ maxWidth: '150px' }}>
                          {order.isPaid ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
                        </Badge>
                      )}
                      {!order.isPaid && order.paymentMethod === 'VNPay' && order.status !== 'Đã hủy' && (
                        <button 
                          onClick={() => handleVNPayRetry(order._id)}
                          className="btn btn-sm btn-outline-danger w-100" 
                          style={{ maxWidth: '150px', fontSize: '13px' }}
                        >
                          Thanh toán lại
                        </button>
                      )}

                      {/* Nút Hủy đơn hàng */}
                      {order.status !== 'Đã hủy' && order.status !== 'Đã giao thành công' && (
                        (order.paymentMethod === 'COD' && order.status === 'Chờ xử lý') || 
                        (order.paymentMethod === 'VNPay' && !order.isPaid)
                      ) && (
                        <button 
                          onClick={() => cancelOrderHandler(order._id)}
                          className="btn btn-sm btn-danger w-100 mt-1" 
                          style={{ maxWidth: '150px', fontSize: '13px' }}
                        >
                          Hủy đơn hàng
                        </button>
                      )}
                    </Col>
                  </Row>

                  {/* Dòng 2: Địa chỉ giao hàng */}
                  <div className="mt-2 pt-2 border-top small text-muted d-flex align-items-center gap-2">
                    📍 {order.shippingAddress.address}, {order.shippingAddress.city} — SĐT: {order.shippingAddress.phone}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div className="mt-4">
        <Link className="btn btn-light border shadow-sm d-inline-flex align-items-center gap-2" to="/">
          <FaArrowLeft /> Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
};

export default OrderScreen;
