import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
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
    <div className="admin-contact-list">
      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="fw-bold mb-0">
            <FaEnvelope className="me-2 text-danger" />Tin nhắn liên hệ
          </h3>
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
                <th className="ps-4 py-3 d-none d-md-table-cell">Ngày gửi</th>
                <th className="py-3">Người gửi</th>
                <th className="py-3 d-none d-lg-table-cell">Email</th>
                <th className="py-3">Nội dung</th>
                <th className="py-3 text-end pe-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact._id}>
                  <td className="ps-4 text-muted small d-none d-md-table-cell">
                    {new Date(contact.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <div className="fw-bold text-dark">{contact.name}</div>
                    <div className="d-lg-none text-muted smaller" style={{ fontSize: '0.7rem' }}>{contact.email}</div>
                    <div className="d-md-none text-muted smaller mt-1" style={{ fontSize: '0.65rem' }}>
                      {new Date(contact.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="d-none d-lg-table-cell">
                    <a href={`mailto:${contact.email}`} className="text-decoration-none text-muted small">{contact.email}</a>
                  </td>
                  <td>
                    <div className="text-dark bg-light p-2 p-md-3 rounded-3 message-text" style={{ minWidth: '150px', maxWidth: '400px', fontSize: '0.85rem' }}>
                      {contact.message}
                    </div>
                  </td>
                  <td className="text-end pe-4">
                    <Button 
                      variant="outline-danger" 
                      className="btn-sm border-0 bg-light rounded-3 p-2" 
                      onClick={() => deleteHandler(contact._id)}
                      title="Xóa tin nhắn"
                    >
                      <FaTrash size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    Chưa có tin nhắn liên hệ nào.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default ContactListScreen;
