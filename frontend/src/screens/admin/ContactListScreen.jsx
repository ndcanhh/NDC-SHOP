import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../../context/authContextValue';
import { toast } from 'react-toastify';
import { FaTrash, FaEnvelope } from 'react-icons/fa';

const ContactListScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!userInfo || !userInfo.token || !userInfo.isAdmin) return;
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/contacts', config);
        setContacts(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchContacts();
  }, [userInfo, refresh]);

  const deleteHandler = async (id) => {
    if (!userInfo || !userInfo.token) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/contacts/${id}`, config);
        toast.success('Đã xóa tin nhắn!');
        setRefresh(prev => prev + 1); // Kích hoạt useEffect tải lại dữ liệu
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      }
    }
  };

  return (
    <>
      <h2 className="mb-4">
        <FaEnvelope className="me-2 text-danger" />
        Tin nhắn Liên hệ
      </h2>
      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Table striped bordered hover responsive className="table-sm text-center align-middle shadow-sm">
          <thead className="bg-danger text-white">
            <tr>
              <th>NGÀY GỬI</th>
              <th>HỌ TÊN</th>
              <th>EMAIL</th>
              <th>NỘI DUNG</th>
              <th>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact._id}>
                <td>{new Date(contact.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="fw-bold">{contact.name}</td>
                <td>{contact.email}</td>
                <td className="text-start" style={{ minWidth: '300px' }}>{contact.message}</td>
                <td>
                  <Button variant="danger" className="btn-sm" onClick={() => deleteHandler(contact._id)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted">
                  Chưa có tin nhắn liên hệ nào.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default ContactListScreen;
