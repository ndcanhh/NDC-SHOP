import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Card, Button, Form, Modal, Spinner, Badge, Alert, Row, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import { AuthContext } from '../context/authContextValue';
import { toast } from 'react-toastify';

const AddressBook = () => {
  const { userInfo } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dữ liệu API Hành chính
  const [provincesData, setProvincesData] = useState([]);
  const [wardsData, setWardsData] = useState([]);
  
  // Dữ liệu Form
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // States chọn địa chỉ
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedProvinceName, setSelectedProvinceName] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');
  const [selectedWardName, setSelectedWardName] = useState('');

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/addresses', config);
      setAddresses(data);
    } catch (err) {
      setError('Không thể tải danh sách địa chỉ!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userInfo.token]);

  const fetchProvinces = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/addresses/provinces');
      setProvincesData(data);
    } catch (err) {
      console.error("Không thể lấy dữ liệu tỉnh thành", err);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
    fetchProvinces();
  }, [fetchAddresses, fetchProvinces]);

  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedProvinceCode) {
        setWardsData([]);
        return;
      }
      try {
        const { data } = await axios.get(`/api/addresses/wards/${selectedProvinceCode}`);
        setWardsData(data);
      } catch (err) {
        console.error("Lỗi lấy phường xã", err);
      }
    };
    fetchWards();
  }, [selectedProvinceCode]);

  const handleOpenModal = (addr = null) => {
    if (addr) {
      setEditId(addr._id);
      setRecipientName(addr.recipientName);
      setPhone(addr.phone);
      
      const foundProv = provincesData.find(p => p.name === addr.city || addr.city.includes(p.name));
      if (foundProv) {
        setSelectedProvinceCode(foundProv.code);
        setSelectedProvinceName(foundProv.name);
      } else {
        setSelectedProvinceCode('');
        setSelectedProvinceName('');
      }

      setHouseNumber(addr.address);
      setSelectedWardCode('');
      setSelectedWardName('');
      
      setIsDefault(addr.isDefault);
    } else {
      setEditId(null);
      setRecipientName(userInfo?.name || '');
      setPhone(userInfo?.phone || '');
      setHouseNumber('');
      setSelectedProvinceCode('');
      setSelectedProvinceName('');
      setSelectedWardCode('');
      setSelectedWardName('');
      setIsDefault(addresses.length === 0);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    // Regex chuẩn Unicode cho tiếng Việt (Hỗ trợ tất cả các loại dấu)
    const nameRegex = /^[\p{L}\s]+$/u;
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

    if (!recipientName.trim() || !nameRegex.test(recipientName)) {
      toast.warn("Tên người nhận không hợp lệ (Không chứa số hoặc ký tự đặc biệt)!");
      return;
    }

    if (!phoneRegex.test(phone)) {
      toast.warn("Số điện thoại không hợp lệ (phải có 10 số, bắt đầu bằng 03, 05, 07, 08, 09)!");
      return;
    }

    if (!houseNumber.trim()) {
      toast.warn("Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường)!");
      return;
    }

    if (!selectedProvinceCode || !selectedWardCode) {
      toast.warn("Vui lòng chọn đầy đủ Tỉnh/Thành phố và Phường/Xã!");
      return;
    }

    setActionLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}`, 'Content-Type': 'application/json' } };
      
      // Gộp data đúng cấu trúc 2 cấp mới
      const cityText = selectedProvinceName;
      let addressText = houseNumber;
      if (!houseNumber.includes(selectedWardName)) {
        addressText = `${houseNumber}, ${selectedWardName}`;
      }

      const payload = { 
        recipientName, 
        phone, 
        address: addressText, 
        city: cityText, 
        isDefault 
      };
      
      if (editId) {
        await axios.put(`/api/addresses/${editId}`, payload, config);
      } else {
        await axios.post('/api/addresses', payload, config);
      }
      await fetchAddresses();
      handleCloseModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      setActionLoading(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`/api/addresses/${id}`, config);
      await fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa địa chỉ!');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    if (!window.confirm('Bạn có muốn đặt địa chỉ này làm mặc định không?')) return;
    try {
      setActionLoading(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`/api/addresses/${id}/default`, {}, config);
      await fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật mặc định!');
    } finally {
      setActionLoading(false);
    }
  };

  // Xóa các mảng tính toán cũ

  return (
    <div className="address-book">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">Địa chỉ của tôi</h5>
        <Button variant="danger" size="sm" onClick={() => handleOpenModal()} className="d-flex align-items-center gap-2 rounded-pill px-4 py-2 shadow-sm fw-bold">
          <FaPlus /> Thêm địa chỉ mới
        </Button>
      </div>

      {error && <Alert variant="danger" className="rounded-3 border-0">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <FaMapMarkerAlt size={48} className="mb-3 opacity-50" />
          <p>Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ giao hàng!</p>
        </div>
      ) : (
        <div className="address-list">
          {addresses.map((addr) => (
            <Card key={addr._id} className={`mb-4 border-0 shadow-sm rounded-4 overflow-hidden ${addr.isDefault ? 'bg-light' : ''}`}>
              {addr.isDefault && <div style={{ height: '4px', background: 'linear-gradient(135deg, #d70018, #ff4d4f)' }}></div>}
              <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="fw-bold fs-5">{addr.recipientName}</span>
                    <span className="text-muted">|</span>
                    <span className="text-muted fw-semibold">{addr.phone}</span>
                    {addr.isDefault && (
                      <Badge bg="danger" className="ms-2 rounded-pill px-3 py-2 shadow-sm">Mặc định</Badge>
                    )}
                  </div>
                  <div className="text-secondary small d-flex flex-column gap-1">
                    <span><FaMapMarkerAlt className="me-2" />{addr.address}</span>
                    <span>Tỉnh/Thành: {addr.city}</span>
                  </div>
                </div>
                
                <div className="d-flex flex-row flex-md-column align-items-end justify-content-center gap-2 mt-3 mt-md-0">
                  <div className="d-flex gap-2 mb-1">
                    <Button variant="light" className="rounded-circle shadow-sm d-flex align-items-center justify-content-center border" style={{ width: '38px', height: '38px' }} onClick={() => handleOpenModal(addr)} title="Sửa địa chỉ">
                      <FaEdit className="text-primary" />
                    </Button>
                    {!addr.isDefault && (
                      <Button variant="light" className="rounded-circle shadow-sm d-flex align-items-center justify-content-center border" style={{ width: '38px', height: '38px' }} onClick={() => handleDelete(addr._id)} title="Xóa địa chỉ">
                        <FaTrash className="text-danger" />
                      </Button>
                    )}
                  </div>
                  {!addr.isDefault && (
                    <Button variant="outline-danger" size="sm" className="rounded-pill px-3 py-1 fw-bold border-2 shadow-sm" onClick={() => handleSetDefault(addr._id)} disabled={actionLoading}>
                      Thiết lập mặc định
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Thêm / Sửa Địa Chỉ */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg" contentClassName="border-0 rounded-4 shadow-lg">
        <Modal.Header closeButton className="border-bottom-0 pt-4 px-4 pb-0">
          <Modal.Title className="fw-bold">{editId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveAddress}>
          <Modal.Body className="p-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-muted small text-uppercase">Tên người nhận</Form.Label>
                  <Form.Control type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required className="border-0 bg-light rounded-3 px-3 py-2" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-muted small text-uppercase">Số điện thoại</Form.Label>
                  <Form.Control type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required className="border-0 bg-light rounded-3 px-3 py-2" />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-muted small text-uppercase">Tỉnh / Thành phố</Form.Label>
                  <Form.Select 
                    value={selectedProvinceCode}
                    onChange={(e) => {
                      setSelectedProvinceCode(e.target.value);
                      setSelectedProvinceName(e.target.options[e.target.selectedIndex].text);
                      // Clear con
                      setSelectedWardCode('');
                      setSelectedWardName('');
                    }}
                    required
                    className="border-0 bg-light rounded-3 px-3 py-2"
                  >
                    <option value="">Chọn Tỉnh/Thành</option>
                    {provincesData.map(p => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-muted small text-uppercase">Phường / Xã / Thị trấn</Form.Label>
                  <Form.Select 
                    value={selectedWardCode}
                    onChange={(e) => {
                      setSelectedWardCode(e.target.value);
                      setSelectedWardName(e.target.options[e.target.selectedIndex].text);
                    }}
                    required
                    disabled={!selectedProvinceCode}
                    className="border-0 bg-light rounded-3 px-3 py-2"
                  >
                    <option value="">Chọn Phường/Xã/Thị trấn</option>
                    {wardsData.map(w => (
                      <option key={w.code} value={w.code}>{w.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-muted small text-uppercase">Địa chỉ cụ thể (Số nhà, Tên đường)</Form.Label>
              <Form.Control type="text" placeholder="VD: Số nhà 123, đường Nguyễn Văn A" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} required className="border-0 bg-light rounded-3 px-3 py-2" />
              {editId && houseNumber && !selectedWardCode && (
                 <Form.Text className="text-warning">
                   * Địa chỉ cũ: {houseNumber}. Vui lòng phân loại lại bằng các danh sách chọn bên trên và điền Số Nhà chính xác vào đây.
                 </Form.Text>
              )}
            </Form.Group>

            {(!editId || !addresses.find(a => a._id === editId)?.isDefault) && addresses.length > 0 && (
              <Form.Check 
                type="checkbox" 
                id="defaultCheck" 
                label="Đặt làm địa chỉ mặc định" 
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="text-muted mt-2 fw-semibold"
              />
            )}
            {editId && addresses.find(a => a._id === editId)?.isDefault && (
               <small className="text-danger d-block mt-2 fw-semibold">Đây là địa chỉ mặc định của bạn.</small>
            )}
          </Modal.Body>
          <Modal.Footer className="border-top-0 px-4 pb-4 pt-0">
            <Button variant="secondary" onClick={handleCloseModal} className="rounded-pill px-4 fw-bold shadow-sm">Hủy</Button>
            <Button variant="danger" type="submit" disabled={actionLoading || !provincesData.length} className="rounded-pill px-4 fw-bold shadow-sm">
              {actionLoading ? <Spinner size="sm" animation="border" /> : 'Lưu lại'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AddressBook;
