import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Spinner, Alert, Modal, Form, Row, Col, Badge, Card } from 'react-bootstrap';
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

    // Regex: Chỉ chữ cái và số, từ 3-20 ký tự
    const codeRegex = /^[A-Z0-9]{3,20}$/;
    if (!codeRegex.test(formData.code)) {
      toast.error('Mã giảm giá không hợp lệ! (Chỉ dùng chữ cái và số, từ 3-20 ký tự)');
      return;
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      toast.error('Giá trị giảm theo % không được vượt quá 100%!');
      return;
    }

    if (formData.discountValue <= 0) {
      toast.error('Giá trị giảm phải lớn hơn 0!');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/api/coupons', formData, config);
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
          <h3 className="fw-bold mb-0">Quản lý mã giảm giá</h3>
        </Col>
        <Col className="text-end">
          <Button variant="danger" className="rounded-pill px-4 fw-bold shadow-sm" onClick={openModal}>
            <FaPlus className="me-2" />Tạo mã mới
          </Button>
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
                <th className="ps-4 py-3">Mã giảm giá</th>
                <th className="py-3 d-none d-md-table-cell">Loại</th>
                <th className="py-3">Giá trị giảm</th>
                <th className="py-3 d-none d-lg-table-cell">Đơn tối thiểu</th>
                <th className="py-3 text-center d-none d-md-table-cell">Đã dùng</th>
                <th className="py-3 text-center d-none d-lg-table-cell">Hạn sử dụng</th>
                <th className="py-3 text-center">Trạng thái</th>
                <th className="py-3 text-end pe-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr><td colSpan={8} className="text-muted text-center py-5">Chưa có mã giảm giá nào.</td></tr>
              ) : coupons.map((c) => (
                <tr key={c._id}>
                  <td className="ps-4">
                    <div className="badge bg-dark fs-6 px-2 py-1 mb-1" style={{ letterSpacing: '1px' }}>
                      {c.code}
                    </div>
                    <div className="d-md-none text-muted smaller" style={{ fontSize: '0.7rem' }}>
                      Hạn: {new Date(c.expirationDate).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="d-none d-md-table-cell">
                    {c.discountType === 'percentage'
                      ? <Badge pill bg="info" className="text-dark px-2">Phần trăm</Badge>
                      : <Badge pill bg="primary" className="px-2">Tiền mặt</Badge>}
                  </td>
                  <td className="fw-bold text-danger">
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}%`
                      : `${c.discountValue.toLocaleString('vi-VN')}đ`}
                    <div className="d-lg-none text-muted smaller fw-normal" style={{ fontSize: '0.7rem' }}>
                      Đơn ≥ {c.minOrderValue.toLocaleString('vi-VN')}đ
                    </div>
                  </td>
                  <td className="d-none d-lg-table-cell">{c.minOrderValue.toLocaleString('vi-VN')} đ</td>
                  <td className="text-center d-none d-md-table-cell">
                    <span className={c.usedCount >= c.usageLimit ? 'text-danger fw-bold' : 'text-muted fw-medium'}>
                      {c.usedCount}/{c.usageLimit}
                    </span>
                  </td>
                  <td className={`text-center d-none d-lg-table-cell ${isExpired(c.expirationDate) ? 'text-danger fw-bold' : 'text-muted'}`}>
                    {new Date(c.expirationDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="text-center" onClick={() => handleToggle(c)} style={{ cursor: 'pointer' }} title="Click để Bật/Tắt mã">
                    <div style={{ transform: 'scale(0.9)' }}>{getStatus(c)}</div>
                  </td>
                  <td className="text-end pe-4">
                    <Button
                      variant="outline-danger"
                      className="btn-sm border-0 bg-light rounded-3 p-2"
                      onClick={() => handleDelete(c._id, c.code)}
                      title="Xóa mã giảm giá"
                    >
                      <FaTrash size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
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
