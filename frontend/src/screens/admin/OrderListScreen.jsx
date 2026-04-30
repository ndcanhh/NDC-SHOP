import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Spinner, Alert, Badge, Modal, Row, Col, ListGroup, Image } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../../context/authContextValue';
import { toast } from 'react-toastify';
import { FaEye } from 'react-icons/fa';

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
    // Ưu tiên dùng selectedOrder nếu khớp ID, nếu không tìm trong danh sách orders
    const currentOrder = (selectedOrder && selectedOrder._id.toString() === id.toString()) 
      ? selectedOrder 
      : orders.find(o => o._id.toString() === id.toString());

    if (!currentOrder) {
      toast.error('Lỗi: Không tìm thấy thông tin đơn hàng.');
      return;
    }

    // Validate: Không cho phép chuyển ĐVVC nếu dùng VNPay mà chưa thanh toán
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

  return (
    <>
      <h2 className="mb-4">Danh sách Đơn hàng</h2>
      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Table striped bordered hover responsive className="table-sm text-center align-middle">
          <thead>
            <tr>
              <th>ID ĐƠN HÀNG</th>
              <th>KHÁCH HÀNG</th>
              <th>TỔNG TIỀN</th>
              <th>TRẠNG THÁI</th>
              <th>NGÀY ĐẶT</th>
              <th>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user ? order.user.name : <span className="text-muted fst-italic">Khách (Tài khoản đã xóa)</span>}</td>
                <td className="text-danger fw-bold">{order.totalPrice.toLocaleString('vi-VN')} đ</td>
                <td>
                  <Badge bg={
                    order.status === 'Đã giao thành công' ? 'success' :
                    order.status === 'Đã chuyển cho đơn vị vận chuyển' ? 'info' :
                    order.status === 'Đã hủy' ? 'danger' : 'secondary'
                  }>
                    {order.status}
                  </Badge>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                   <Button variant="light" className="btn-sm border" onClick={() => handleShowModal(order)} title="Xem chi tiết">
                     <FaEye />
                   </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal Chi tiết đơn hàng */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết Đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row>
                <Col md={6}>
                  <h5>Thông tin khách hàng</h5>
                  <p className="mb-1"><strong>Tên:</strong> {selectedOrder.user ? selectedOrder.user.name : 'Khách'}</p>
                  <p className="mb-1"><strong>Email:</strong> {selectedOrder.user ? selectedOrder.user.email : 'Không có'}</p>
                  <p className="mb-1"><strong>SĐT:</strong> {selectedOrder.shippingAddress.phone}</p>
                  <p className="mb-1"><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}</p>
                </Col>
                <Col md={6}>
                  <h5>Thông tin thanh toán</h5>
                  <p className="mb-1"><strong>Phương thức:</strong> {selectedOrder.paymentMethod}</p>
                  {selectedOrder.paymentMethod === 'VNPay' && (
                    <p className="mb-1">
                      <strong>Trạng thái:</strong>{' '}
                      {selectedOrder.isPaid ? (
                        <Badge bg="success">Đã thanh toán ({new Date(selectedOrder.paidAt).toLocaleDateString('vi-VN')})</Badge>
                      ) : (
                        <Badge bg="danger">Chưa thanh toán</Badge>
                      )}
                    </p>
                  )}
                  <p className="mb-1">
                    <strong>Tình trạng giao:</strong>{' '}
                    <Badge bg={
                      selectedOrder.status === 'Đã giao thành công' ? 'success' :
                      selectedOrder.status === 'Đã chuyển cho đơn vị vận chuyển' ? 'info' :
                      selectedOrder.status === 'Đang giao' ? 'warning' : 
                      selectedOrder.status === 'Đã hủy' ? 'danger' : 'secondary'
                    }>
                      {selectedOrder.status}
                    </Badge>
                  </p>
                </Col>
              </Row>
              <h5 className="mt-4">Sản phẩm đã đặt</h5>
              <ListGroup variant="flush">
                {selectedOrder.orderItems.map((item, index) => (
                  <ListGroup.Item key={index}>
                    <Row className="align-items-center">
                      <Col xs={3} md={2}>
                        <Image src={item.image} alt={item.name} fluid rounded />
                      </Col>
                      <Col xs={9} md={5}>
                        <div>{item.name}</div>
                        {(item.color || item.storageLabel) && (
                          <div className="text-muted small">
                            {item.color && <span>Màu: {item.color}</span>}
                            {item.color && item.storageLabel && <span className="mx-1">|</span>}
                            {item.storageLabel && <span>Bản: {item.storageLabel}</span>}
                          </div>
                        )}
                      </Col>
                      <Col md={5} className="text-md-end fw-bold mt-2 mt-md-0 text-nowrap">
                        {item.qty} x {item.price.toLocaleString('vi-VN')} đ = {(item.qty * item.price).toLocaleString('vi-VN')} đ
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <h5 className="text-end mt-3 text-danger fw-bold">
                Tổng cộng: {selectedOrder.totalPrice.toLocaleString('vi-VN')} đ
              </h5>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <div>
            {selectedOrder && selectedOrder.status === 'Chờ xử lý' && (
              <>
                 <Button variant="info" className="me-2 text-white" onClick={() => updateStatusHandler(selectedOrder._id, 'Đã chuyển cho đơn vị vận chuyển')}>
                   Chuyển ĐVVC
                 </Button>
                 <Button variant="danger" onClick={() => updateStatusHandler(selectedOrder._id, 'Đã hủy')}>
                   Hủy đơn
                 </Button>
              </>
            )}
          </div>
          <Button variant="secondary" onClick={handleCloseModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OrderListScreen;
