import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../../context/authContextValue';
import { toast } from 'react-toastify';

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
    <>
      <h2 className="mb-4">Danh sách Khách hàng</h2>
      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Table striped bordered hover responsive className="table-sm text-center align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Admin</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td><a href={`mailto:${user.email}`}>{user.email}</a></td>
                <td>
                  {user.isAdmin ? (
                    <span className="text-success fw-bold">Có</span>
                  ) : (
                    <span className="text-danger">Không</span>
                  )}
                </td>
                <td>
                  {!user.isAdmin && (
                    <Button
                      variant="danger"
                      className="btn-sm"
                      onClick={() => deleteHandler(user._id)}
                    >
                      Xóa
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

export default UserListScreen;
