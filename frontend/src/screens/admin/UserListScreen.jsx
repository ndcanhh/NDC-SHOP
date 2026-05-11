import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Spinner, Alert, Badge, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../../context/authContextValue';
import { toast } from 'react-toastify';
import { FaTrash, FaUserShield, FaUser } from 'react-icons/fa';

const UserListScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [refreshList, setRefreshList] = useState(false);

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      axios.get('/api/users', config)
        .then(({ data }) => {
          setUsers(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.response?.data?.message || err.message);
          setLoading(false);
        });
    }
  }, [userInfo, refreshList]);

  const deleteHandler = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/users/${id}`, config);
        toast.success('Đã xóa thành công!');
        setRefreshList(!refreshList); // Tải lại danh sách
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      }
    }
  };

  return (
    <div className="admin-user-list">
      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="fw-bold mb-0">Danh sách khách hàng</h3>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>
      ) : (
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light">
              <tr className="text-muted small text-uppercase fw-bold">
                <th className="ps-4 py-3">Mã khách hàng</th>
                <th className="py-3">Thông tin khách hàng</th>
                <th className="py-3">Email</th>
                <th className="py-3 text-center">Vai trò</th>
                <th className="py-3 text-end pe-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="ps-4">
                    <span className="fw-bold text-dark">#{user._id.substring(user._id.length - 8).toUpperCase()}</span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center text-secondary" style={{ width: '40px', height: '40px' }}>
                        {user.isAdmin ? <FaUserShield size={18} /> : <FaUser size={18} />}
                      </div>
                      <span className="fw-medium text-dark">{user.name}</span>
                    </div>
                  </td>
                  <td>
                    <a href={`mailto:${user.email}`} className="text-decoration-none text-muted">{user.email}</a>
                  </td>
                  <td className="text-center">
                    {user.isAdmin ? (
                      <Badge bg="danger" className="px-3 rounded-pill">Admin</Badge>
                    ) : (
                      <Badge bg="light" text="dark" className="border px-3 rounded-pill text-secondary">Khách hàng</Badge>
                    )}
                  </td>
                  <td className="text-end pe-4">
                    {!user.isAdmin && (
                      <Button
                        variant="outline-danger"
                        className="btn-sm border-0 bg-light rounded-3"
                        onClick={() => deleteHandler(user._id)}
                        title="Xóa khách hàng"
                      >
                        <FaTrash />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default UserListScreen;
