import React, { useState, useEffect, useContext } from 'react';
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
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');
  const [selectedWardName, setSelectedWardName] = useState('');

  useEffect(() => {
    fetchAddresses();
    fetchProvinces();
    // eslint-disable-next-line
  }, [userInfo]);

  const fetchAddresses = async () => {
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
  };

  const fetchProvinces = async () => {
    try {
      const { data } = await axios.get('https://provinces.open-api.vn/api/?depth=3');
      setProvincesData(data);
    } catch (err) {
      console.error("Không thể lấy dữ liệu tỉnh thành", err);
    }
  };

  const handleOpenModal = (addr = null) => {
    if (addr) {
      setEditId(addr._id);
      setRecipientName(addr.recipientName);
      setPhone(addr.phone);
      
      // Fallback: Vì địa chỉ cũ là text tự do (VD: address: "nhà 1, xã A, huyện B", city: "Hà Nội")
      // Nếu map không trúng, buộc user phải chọn lại xã/huyện
      const foundProv = provincesData.find(p => p.name === addr.city || addr.city.includes(p.name));
      if (foundProv) {
        setSelectedProvinceCode(foundProv.code);
        setSelectedProvinceName(foundProv.name);
      } else {
        setSelectedProvinceCode('');
        setSelectedProvinceName('');
      }

      setHouseNumber(addr.address);
      setSelectedDistrictCode('');
      setSelectedDistrictName('');
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
      setSelectedDistrictCode('');
      setSelectedDistrictName('');
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
    if (!selectedProvinceCode || !selectedDistrictCode || !selectedWardCode) {
      toast.warn("Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện, Phường/Xã!");
      return;
    }

    setActionLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}`, 'Content-Type': 'application/json' } };
      
      // Gộp data đúng cấu trúc để không ảnh hưởng CSDL backend
      const cityText = selectedProvinceName;
      // Dấu phẩy + space để format đẹp
      let addressText = houseNumber;
      if (!houseNumber.includes(selectedWardName)) { // Tránh lặp lại nếu lúc sửa họ truyền cả string
        addressText = `${houseNumber}, ${selectedWardName}, ${selectedDistrictName}`;
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

  // Tính toán mảng data cho Select
  const currentDistricts = provincesData.find(p => p.code === Number(selectedProvinceCode))?.districts || [];
  const currentWards = currentDistricts.find(d => d.code === Number(selectedDistrictCode))?.wards || [];

  return (
    <div className="address-book">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">Địa chỉ của tôi</h5>
        <Button variant="danger" size="sm" onClick={() => handleOpenModal()} className="d-flex align-items-center gap-2">
          <FaPlus /> Thêm địa chỉ mới
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

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
            <Card key={addr._id} className={`mb-3 border-1 ${addr.isDefault ? 'border-danger bg-light' : 'border-light-subtle'}`}>
              <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="fw-bold fs-5">{addr.recipientName}</span>
                    <span className="text-muted">|</span>
                    <span className="text-muted fw-semibold">{addr.phone}</span>
                    {addr.isDefault && (
                      <Badge bg="danger" className="ms-2">Mặc định</Badge>
                    )}
                  </div>
                  <div className="text-secondary small d-flex flex-column gap-1">
                    <span><FaMapMarkerAlt className="me-2" />{addr.address}</span>
                    <span>Tỉnh/Thành: {addr.city}</span>
                  </div>
                </div>
                
                <div className="d-flex flex-row flex-md-column align-items-end justify-content-center gap-2 mt-3 mt-md-0">
                  <div>
                    <Button variant="link" className="text-primary text-decoration-none p-0 me-3" onClick={() => handleOpenModal(addr)}>
                      <FaEdit className="me-1" /> Sửa
                    </Button>
                    {!addr.isDefault && (
                      <Button variant="link" className="text-danger text-decoration-none p-0" onClick={() => handleDelete(addr._id)}>
                        <FaTrash className="me-1" /> Xóa
                      </Button>
                    )}
                  </div>
                  {!addr.isDefault && (
                    <Button variant="outline-danger" size="sm" className="rounded-pill px-3" onClick={() => handleSetDefault(addr._id)} disabled={actionLoading}>
                      <FaCheck className="me-1" /> Đặt mặc định
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Thêm / Sửa Địa Chỉ */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveAddress}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Tên người nhận</Form.Label>
                  <Form.Control type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Số điện thoại</Form.Label>
                  <Form.Control type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Tỉnh / Thành phố</Form.Label>
                  <Form.Select 
                    value={selectedProvinceCode}
                    onChange={(e) => {
                      setSelectedProvinceCode(e.target.value);
                      setSelectedProvinceName(e.target.options[e.target.selectedIndex].text);
                      // Clear con
                      setSelectedDistrictCode('');
                      setSelectedDistrictName('');
                      setSelectedWardCode('');
                      setSelectedWardName('');
                    }}
                    required
                  >
                    <option value="">Chọn Tỉnh/Thành</option>
                    {provincesData.map(p => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Quận / Huyện</Form.Label>
                  <Form.Select 
                    value={selectedDistrictCode}
                    onChange={(e) => {
                      setSelectedDistrictCode(e.target.value);
                      setSelectedDistrictName(e.target.options[e.target.selectedIndex].text);
                      // Clear con
                      setSelectedWardCode('');
                      setSelectedWardName('');
                    }}
                    required
                    disabled={!selectedProvinceCode}
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {currentDistricts.map(d => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Phường / Xã</Form.Label>
                  <Form.Select 
                    value={selectedWardCode}
                    onChange={(e) => {
                      setSelectedWardCode(e.target.value);
                      setSelectedWardName(e.target.options[e.target.selectedIndex].text);
                    }}
                    required
                    disabled={!selectedDistrictCode}
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {currentWards.map(w => (
                      <option key={w.code} value={w.code}>{w.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Địa chỉ cụ thể (Số nhà, Tên đường)</Form.Label>
              <Form.Control type="text" placeholder="VD: Số nhà 123, đường Nguyễn Văn A" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} required />
              {editId && houseNumber && !selectedWardCode && (
                 <Form.Text className="text-warning">
                   * Địa chỉ cũ: {houseNumber}. Vui lòng phân loại lại bằng các danh sách chọn bên trên và điền Số Nhà chính xác vào đây.
                 </Form.Text>
              )}
            </Form.Group>

            {!isDefault && addresses.length > 0 && (
              <Form.Check 
                type="checkbox" 
                id="defaultCheck" 
                label="Đặt làm địa chỉ mặc định" 
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="text-muted mt-2"
              />
            )}
            {isDefault && editId && (
               <small className="text-danger d-block mt-2">Đây là địa chỉ mặc định của bạn.</small>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Hủy</Button>
            <Button variant="danger" type="submit" disabled={actionLoading || !provincesData.length}>
              {actionLoading ? <Spinner size="sm" animation="border" /> : 'Lưu lại'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AddressBook;
