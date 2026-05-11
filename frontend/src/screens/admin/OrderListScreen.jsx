import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Spinner, Alert, Badge, Modal, Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../../context/authContextValue';
import { toast } from 'react-toastify';
import { FaEye, FaTrash } from 'react-icons/fa';

const OrderListScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [refreshList, setRefreshList] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleShowModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      axios.get('/api/orders', config)
        .then(({ data }) => {
          setOrders(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.response?.data?.message || err.message);
          setLoading(false);
        });
    }
  }, [userInfo, refreshList]);

  const updateStatusHandler = async (id, newStatus) => {
    const currentOrder = (selectedOrder && selectedOrder._id.toString() === id.toString()) 
      ? selectedOrder 
      : orders.find(o => o._id.toString() === id.toString());

    if (!currentOrder) {
      toast.error('Lỗi: Không tìm thấy thông tin đơn hàng.');
      return;
    }

    if (newStatus === 'Đã chuyển cho đơn vị vận chuyển') {
      if (currentOrder.paymentMethod === 'VNPay' && !currentOrder.isPaid) {
        toast.error('Không thể chuyển giao hàng! Khách hàng chưa hoàn tất thanh toán qua VNPay.');
        return;
      }
    }

    if (window.confirm(`Bạn muốn chuyển trạng thái thành "${newStatus}"?`)) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.put(`/api/orders/${id}/status`, { status: newStatus }, config);
        toast.success('Cập nhật trạng thái thành công!');
        setRefreshList(!refreshList);
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      }
    }
  };

  const deleteOrderHandler = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng này không?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/orders/${id}`, config);
        toast.success('Đã xóa đơn hàng thành công!');
        setRefreshList(!refreshList);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      }
    }
  };

  return (
    <div className="admin-order-list">
      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="fw-bold mb-0">Danh sách đơn hàng</h3>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center p-5">
          <Spinner animation="border" variant="danger" />
        </div>
      ) : error ? (
        <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>
      ) : (
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light">
              <tr className="text-muted small text-uppercase fw-bold">
                <th className="ps-4 py-3">Mã đơn hàng</th>
                <th className="py-3">Khách hàng</th>
                <th className="py-3">Tổng tiền</th>
                <th className="py-3 text-center">Trạng thái</th>
                <th className="py-3 text-center">Ngày đặt</th>
                <th className="py-3 text-end pe-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="ps-4">
                    <span className="fw-bold text-dark">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                  </td>
                  <td>
                    <div className="fw-medium">{order.user ? order.user.name : <span className="text-muted fst-italic">Khách vãng lai</span>}</div>
                  </td>
                  <td className="text-danger fw-bold">{order.totalPrice.toLocaleString('vi-VN')} đ</td>
                  <td className="text-center">
                    <Badge pill bg="light" className={`border px-3 ${
                      order.status === 'Đã giao thành công' ? 'text-success border-success-subtle' :
                      order.status === 'Đã chuyển cho đơn vị vận chuyển' ? 'text-info border-info-subtle' :
                      order.status === 'Đã hủy' ? 'text-danger border-danger-subtle' : 'text-secondary border-secondary-subtle'
                    }`}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="text-center text-muted small">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      <Button variant="outline-primary" className="btn-sm border-0 bg-light rounded-3" onClick={() => handleShowModal(order)} title="Xem chi tiết">
                        <FaEye />
                      </Button>
                      <Button variant="outline-danger" className="btn-sm border-0 bg-light rounded-3" onClick={() => deleteOrderHandler(order._id)} title="Xóa đơn hàng">
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Modal Chi tiết đơn hàng */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered className="admin-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Chi tiết Đơn hàng #{selectedOrder?._id.substring(selectedOrder._id.length - 8).toUpperCase()}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedOrder && (
            <>
              <Row className="g-4">
                <Col md={6}>
                  <div className="p-3 bg-light rounded-4 h-100">
                    <h6 className="fw-bold mb-3 border-bottom pb-2">Thông tin khách hàng</h6>
                    <p className="mb-1 small text-muted">Tên: <span className="text-dark fw-medium">{selectedOrder.user ? selectedOrder.user.name : 'Khách'}</span></p>
                    <p className="mb-1 small text-muted">Email: <span className="text-dark fw-medium">{selectedOrder.user ? selectedOrder.user.email : 'Không có'}</span></p>
                    <p className="mb-1 small text-muted">SĐT: <span className="text-dark fw-medium">{selectedOrder.shippingAddress.phone}</span></p>
                    <p className="mb-0 small text-muted text-truncate" title={`${selectedOrder.shippingAddress.address}, ${selectedOrder.shippingAddress.city}`}>Địa chỉ: <span className="text-dark fw-medium">{selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}</span></p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 bg-light rounded-4 h-100">
                    <h6 className="fw-bold mb-3 border-bottom pb-2">Thông tin thanh toán</h6>
                    <p className="mb-2 small text-muted">Phương thức: <span className="text-dark fw-medium">{selectedOrder.paymentMethod}</span></p>
                    {selectedOrder.paymentMethod === 'VNPay' && (
                      <div className="mb-2">
                        <span className="small text-muted me-2">Thanh toán:</span>
                        {selectedOrder.isPaid ? (
                          <Badge bg="success" className="smaller">Đã thanh toán ({new Date(selectedOrder.paidAt).toLocaleDateString('vi-VN')})</Badge>
                        ) : (
                          <Badge bg="danger" className="smaller">Chưa thanh toán</Badge>
                        )}
                      </div>
                    )}
                    <div>
                      <span className="small text-muted me-2">Tình trạng:</span>
                      <Badge bg={
                        selectedOrder.status === 'Đã giao thành công' ? 'success' :
                        selectedOrder.status === 'Đã chuyển cho đơn vị vận chuyển' ? 'info' :
                        selectedOrder.status === 'Đang giao' ? 'warning' : 
                        selectedOrder.status === 'Đã hủy' ? 'danger' : 'secondary'
                      } className="smaller">
                        {selectedOrder.status}
                      </Badge>
                    </div>
                  </div>
                </Col>
              </Row>

              <h6 className="fw-bold mt-4 mb-3 ps-2">Sản phẩm đã đặt</h6>
              <div className="border rounded-4 overflow-hidden">
                <ListGroup variant="flush">
                  {selectedOrder.orderItems.map((item, index) => (
                    <ListGroup.Item key={index} className="py-3">
                      <Row className="align-items-center g-3">
                        <Col xs={3} md={2}>
                          <Image src={item.image} alt={item.name} fluid rounded className="shadow-sm" />
                        </Col>
                        <Col xs={9} md={5}>
                          <div className="fw-bold text-dark">{item.name}</div>
                          {(item.color || item.storageLabel) && (
                            <div className="text-muted smaller" style={{ fontSize: '0.75rem' }}>
                              {item.color && <span className="badge bg-light text-dark border me-1">{item.color}</span>}
                              {item.storageLabel && <span className="badge bg-light text-dark border">{item.storageLabel}</span>}
                            </div>
                          )}
                        </Col>
                        <Col md={5} className="text-md-end">
                          <span className="text-muted smaller">{item.qty} x </span>
                          <span className="fw-bold text-danger">{item.price.toLocaleString('vi-VN')} đ</span>
                          <div className="fw-bold mt-1">{(item.qty * item.price).toLocaleString('vi-VN')} đ</div>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>

              <div className="text-center mt-4 p-3 bg-danger-subtle rounded-4">
                 <span className="text-muted me-2">Tổng tiền phải thanh toán:</span>
                 <h4 className="d-inline-block fw-bold text-danger mb-0">
                   {selectedOrder.totalPrice.toLocaleString('vi-VN')} đ
                 </h4>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 p-4 justify-content-between">
          <div className="d-flex gap-2">
            {selectedOrder && selectedOrder.status === 'Chờ xử lý' && (
              <>
                 <Button variant="danger" className="px-4 rounded-pill fw-bold shadow-sm" onClick={() => updateStatusHandler(selectedOrder._id, 'Đã chuyển cho đơn vị vận chuyển')}>
                   Giao ĐVVC
                 </Button>
                 <Button variant="light" className="px-4 rounded-pill fw-bold border" onClick={() => updateStatusHandler(selectedOrder._id, 'Đã hủy')}>
                   Hủy đơn
                 </Button>
              </>
            )}
          </div>
          <Button variant="light" className="px-4 rounded-pill fw-bold border" onClick={handleCloseModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderListScreen;
