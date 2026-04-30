import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Spinner, Alert, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { FaNewspaper, FaPlus, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { AuthContext } from '../../context/authContextValue';
import { toast } from 'react-toastify';

const NewsListScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Tin tức',
    image: '',
    description: '',
    content: '',
    tag: 'Mới',
    tagColor: 'danger',
  });
  const [submitting, setSubmitting] = useState(false);

  const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/news');
        setNews(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [refresh]);

  const deleteHandler = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      await axios.delete(`/api/news/${id}`, config);
      toast.success('Đã xóa bài viết!');
      setRefresh(!refresh);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/news', formData, config);
      toast.success('Đã đăng bài viết mới!');
      setShowModal(false);
      setRefresh(!refresh);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaNewspaper className="me-2 text-danger" />
          Quản lý Tin tức
        </h2>
        <Button variant="danger" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" /> Viết bài mới
        </Button>
      </div>

      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Table striped bordered hover responsive className="table-sm text-center align-middle shadow-sm">
          <thead className="bg-danger text-white">
            <tr>
              <th>NGÀY ĐĂNG</th>
              <th>TIÊU ĐỀ</th>
              <th>DANH MỤC</th>
              <th>THẺ</th>
              <th>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {news.map((n) => (
              <tr key={n._id}>
                <td>{new Date(n.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="text-start fw-bold" style={{ maxWidth: '400px' }}>{n.title}</td>
                <td>{n.category}</td>
                <td>
                  <Badge bg={n.tagColor}>{n.tag}</Badge>
                </td>
                <td>
                  <Button variant="danger" className="btn-sm" onClick={() => deleteHandler(n._id)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
            {news.length === 0 && (
              <tr>
                <td colSpan="5" className="py-4 text-muted">Chưa có bài viết nào trong cơ sở dữ liệu.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Modal Thêm bài viết */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Viết bài tin tức mới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Tiêu đề bài viết</Form.Label>
                  <Form.Control 
                    type="text" 
                    required 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục</Form.Label>
                  <Form.Control 
                    type="text" 
                    required 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})} 
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Link ảnh bìa (Thumbnail)</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="https://..." 
                value={formData.image} 
                onChange={(e) => setFormData({...formData, image: e.target.value})} 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả ngắn</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                required 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nội dung chi tiết</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={5} 
                required 
                value={formData.content} 
                onChange={(e) => setFormData({...formData, content: e.target.value})} 
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Thẻ hiển thị (Tag)</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={formData.tag} 
                    onChange={(e) => setFormData({...formData, tag: e.target.value})} 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Màu thẻ</Form.Label>
                  <Form.Select 
                    value={formData.tagColor} 
                    onChange={(e) => setFormData({...formData, tagColor: e.target.value})}
                  >
                    <option value="danger">Đỏ (Hot/Mới)</option>
                    <option value="primary">Xanh dương (Đánh giá)</option>
                    <option value="success">Xanh lá (Khuyến mãi)</option>
                    <option value="warning">Vàng (So sánh)</option>
                    <option value="info">Xanh nhạt (Tư vấn)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button variant="danger" type="submit" disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Đăng bài viết'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default NewsListScreen;
