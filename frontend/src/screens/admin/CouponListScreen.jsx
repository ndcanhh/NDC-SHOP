import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Spinner, Alert, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { FaTag, FaPlus, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { AuthContext } from '../../context/authContextValue';
import { toast } from 'react-toastify';

const CouponListScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 0,
    usageLimit: 100,
    expirationDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/coupons', config);
        setCoupons(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
    // eslint-disable-next-line
  }, [refresh]);

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Xóa mã giảm giá "${code}"?`)) return;
    try {
      await axios.delete(`/api/coupons/${id}`, config);
      setRefresh(!refresh);
      toast.success('Đã xóa mã giảm giá!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleToggle = async (coupon) => {
    try {
      await axios.put(`/api/coupons/${coupon._id}`, { isActive: !coupon.isActive }, config);
      setRefresh(!refresh);
      toast.success('Đã cập nhật trạng thái mã!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const openModal = () => {
    // Mặc định ngày hết hạn là 1 năm sau
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 0,
      usageLimit: 100,
      expirationDate: nextYear.toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/coupons', formData, config);
      setShowModal(false);
      toast.success('Đã tạo mã giảm giá mới!');
      setShowModal(false);
      setRefresh(!refresh);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isExpired = (date) => new Date() > new Date(date);
  const isExhausted = (c) => c.usedCount >= c.usageLimit;

  const getStatus = (coupon) => {
    if (!coupon.isActive) return <Badge bg="secondary">Đã tắt</Badge>;
    if (isExpired(coupon.expirationDate)) return <Badge bg="danger">Hết hạn</Badge>;
    if (isExhausted(coupon)) return <Badge bg="warning" text="dark">Hết lượt</Badge>;
    return <Badge bg="success">Hoạt động</Badge>;
  };

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h2><FaTag className="me-2 text-danger" />Quản lý Mã Giảm Giá</h2>
        </Col>
        <Col className="text-end">
          <Button className="buy-btn" onClick={openModal}>
            <FaPlus className="me-2" />Tạo mã mới
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Table striped bordered hover responsive className="table-sm text-center align-middle">
          <thead className="table-dark">
            <tr>
              <th>MÃ</th>
              <th>LOẠI</th>
              <th>GIÁ TRỊ GIẢM</th>
              <th>ĐƠN TỐI THIỂU</th>
              <th>ĐÃ DÙNG</th>
              <th>HẠN SỬ DỤNG</th>
              <th>TRẠNG THÁI</th>
              <th>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr><td colSpan={8} className="text-muted py-4">Chưa có mã giảm giá nào.</td></tr>
            ) : coupons.map((c) => (
              <tr key={c._id}>
                <td>
                  <span className="badge bg-dark fs-6 px-3 py-2" style={{ letterSpacing: '1px' }}>
                    {c.code}
                  </span>
                </td>
                <td>
                  {c.discountType === 'percentage'
                    ? <Badge bg="info" text="dark">Phần trăm (%)</Badge>
                    : <Badge bg="primary">Tiền mặt (đ)</Badge>}
                </td>
                <td className="fw-bold text-danger">
                  {c.discountType === 'percentage'
                    ? `${c.discountValue}%`
                    : `${c.discountValue.toLocaleString('vi-VN')} đ`}
                </td>
                <td>{c.minOrderValue.toLocaleString('vi-VN')} đ</td>
                <td>
                  <span className={c.usedCount >= c.usageLimit ? 'text-danger fw-bold' : ''}>
                    {c.usedCount} / {c.usageLimit}
                  </span>
                </td>
                <td className={isExpired(c.expirationDate) ? 'text-danger' : ''}>
                  {new Date(c.expirationDate).toLocaleDateString('vi-VN')}
                </td>
                <td 
                  onClick={() => handleToggle(c)} 
                  style={{ cursor: 'pointer' }}
                  title="Click để Bật/Tắt mã"
                >
                  {getStatus(c)}
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(c._id, c.code)}
                  >
                    <FaTrash className="me-1" />Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal tạo mã mới */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title><FaTag className="me-2 text-danger" />Tạo Mã Giảm Giá Mới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Mã giảm giá</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="VD: WELCOME10"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  />
                  <Form.Text className="text-muted">Tự động chuyển thành CHỮ HOA.</Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Loại giảm giá</Form.Label>
                  <Form.Select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Tiền mặt (đ)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Giá trị giảm {formData.discountType === 'percentage' ? '(%)' : '(đ)'}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min={1}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Đơn tối thiểu (đ)</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Giới hạn lượt dùng</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Ngày hết hạn</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Preview */}
            <div className="p-3 bg-light rounded border mt-1">
              <strong className="text-danger">Xem trước:</strong>
              <div className="mt-1 small">
                Mã <strong>{formData.code || 'XXX'}</strong> giảm{' '}
                <strong>
                  {formData.discountType === 'percentage'
                    ? `${formData.discountValue}%`
                    : `${Number(formData.discountValue).toLocaleString('vi-VN')}đ`}
                </strong>
                {formData.minOrderValue > 0 && ` cho đơn từ ${Number(formData.minOrderValue).toLocaleString('vi-VN')}đ`}
                {', tối đa '}
                <strong>{formData.usageLimit} lượt</strong>
                {', hết hạn '}
                <strong>{formData.expirationDate ? new Date(formData.expirationDate).toLocaleDateString('vi-VN') : '?'}</strong>.
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button variant="danger" type="submit" disabled={submitting}>
              {submitting ? <Spinner animation="border" size="sm" /> : <><FaPlus className="me-1" />Tạo mã</>}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default CouponListScreen;
