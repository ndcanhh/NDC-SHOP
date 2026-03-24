import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../../context/authContextValue';

const OrderListScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [refreshList, setRefreshList] = useState(false);

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
    if (window.confirm(`Bạn muốn chuyển trạng thái thành "${newStatus}"?`)) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.put(`/api/orders/${id}/status`, { status: newStatus }, config);
        alert('Cập nhật trạng thái thành công!');
        setRefreshList(!refreshList);
      } catch (err) {
        alert(err.response?.data?.message || err.message);
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
                <td>{order.user && order.user.name}</td>
                <td className="text-danger fw-bold">{order.totalPrice.toLocaleString('vi-VN')} đ</td>
                <td>
                  <Badge bg={
                    order.status === 'Đã giao thành công' ? 'success' :
                    order.status === 'Đang giao' ? 'warning' : 'secondary'
                  }>
                    {order.status}
                  </Badge>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  {order.status === 'Chờ xử lý' && (
                     <Button variant="warning" className="btn-sm me-2" onClick={() => updateStatusHandler(order._id, 'Đang giao')}>
                       Giao hàng
                     </Button>
                  )}
                  {order.status === 'Đang giao' && (
                     <Button variant="success" className="btn-sm me-2" onClick={() => updateStatusHandler(order._id, 'Đã giao thành công')}>
                       Hoàn tất
                     </Button>
                  )}
                  {order.status !== 'Đã hủy' && order.status !== 'Đã giao thành công' && (
                     <Button variant="danger" className="btn-sm" onClick={() => updateStatusHandler(order._id, 'Đã hủy')}>
                       Hủy
                     </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default OrderListScreen;
