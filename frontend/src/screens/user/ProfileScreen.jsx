import React, { useContext, useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Spinner, Tabs, Tab } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaSave, FaKey, FaMapMarkerAlt } from 'react-icons/fa';
import { AuthContext } from '../../context/authContextValue';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddressBook from '../../components/AddressBook';

const ProfileScreen = () => {
  const { userInfo, setUserInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  // Guard: nếu chưa đăng nhập thì đá về trang login
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);
  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [phone, setPhone] = useState(userInfo?.phone || '');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [loadingSave, setLoadingSave] = useState(false);

  // Mật khẩu
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Lưu thông tin cá nhân vào DB
  const handleSave = async (e) => {
    e.preventDefault();
    setSaved(false);
    setSaveError('');

    // Regex chuẩn Unicode
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    const nameRegex = /^[\p{L}\s]+$/u;

    if (!name.trim() || !nameRegex.test(name)) {
      setSaveError('Họ và tên không hợp lệ (Không chứa số hoặc ký tự đặc biệt)!');
      return;
    }

    if (!emailRegex.test(email)) {
      setSaveError('Địa chỉ email không hợp lệ!');
      return;
    }

    if (phone && !phoneRegex.test(phone)) {
      setSaveError('Số điện thoại không hợp lệ (phải có 10 số, bắt đầu bằng 03, 05, 07, 08, 09)!');
      return;
    }

    try {
      setLoadingSave(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        '/api/users/profile',
        { name, email, phone },
        config
      );

      // Cập nhật lại userInfo trong AuthContext + localStorage
      setUserInfo(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setSaveError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Đã có lỗi xảy ra!'
      );
    } finally {
      setLoadingSave(false);
    }
  };

  const handleTogglePassword = () => {
    setShowChangePassword((prev) => !prev);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMsg('');
    setPasswordError('');
  };

  // Gọi API đổi mật khẩu
  const handleChangePassword = async () => {
    setPasswordMsg('');
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError('Mật khẩu mới không được trùng với mật khẩu cũ!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới và xác nhận không khớp!');
      return;
    }

    try {
      setLoadingPassword(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        '/api/users/password',
        { currentPassword, newPassword },
        config
      );

      setPasswordMsg(data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
    } catch (error) {
      setPasswordError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Đã có lỗi xảy ra!'
      );
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="profile-page py-4">
      <h3 className="mb-4 ps-2 border-start border-danger border-4 fw-bold">
        Hồ sơ cá nhân
      </h3>

      <Row className="g-4">
        {/* Cột trái: Avatar + Tên */}
        <Col md={4} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
            <div style={{ height: '100px', background: 'linear-gradient(135deg, #d70018, #ff4d4f)' }}></div>
            <Card.Body className="text-center px-4 pb-4 pt-0">
              <div 
                className="bg-white rounded-circle shadow-sm d-inline-flex justify-content-center align-items-center mx-auto mb-3"
                style={{ width: '100px', height: '100px', marginTop: '-50px', border: '4px solid #fff' }}
              >
                <FaUser size={40} className="text-secondary" />
              </div>
              <h5 className="fw-bold mb-1">{userInfo?.name}</h5>
              <p className="text-muted small mb-2">{userInfo?.email}</p>
              {userInfo?.phone && <p className="text-muted small mb-3"><FaPhone className="me-1"/> {userInfo.phone}</p>}
              {userInfo?.role === 'admin' && (
                <span className="badge bg-danger mt-1 px-3 py-2 rounded-pill shadow-sm">Quản trị viên</span>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Cột phải: Form chỉnh sửa thông tin */}
        <Col md={8} lg={9}>
          <Tabs defaultActiveKey="profile" id="profile-tabs" className="mb-4 profile-custom-tabs border-0">
            <Tab eventKey="profile" title={<><FaUser className="me-2" />Thông tin chung</>}>
              <Card className="border-0 shadow-sm p-4 rounded-4 rounded-top-0">
                <h5 className="fw-bold mb-4">Chỉnh sửa thông tin</h5>

            {saved && (
              <div className="alert alert-success py-2 rounded-3 border-0">
                Lưu thông tin thành công!
              </div>
            )}

            {saveError && (
              <div className="alert alert-danger py-2 rounded-3 border-0">
                {saveError}
              </div>
            )}

            <Form onSubmit={handleSave}>
              <Row className="g-3">
                <Col md={12} lg={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-muted small text-uppercase">
                      Họ và tên
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập họ và tên..."
                      className="border-0 bg-light rounded-3 px-3 py-2"
                    />
                  </Form.Group>
                </Col>

                <Col md={12} lg={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-muted small text-uppercase">
                      Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập email..."
                      className="border-0 bg-light rounded-3 px-3 py-2"
                    />
                  </Form.Group>
                </Col>

                <Col md={12} lg={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-muted small text-uppercase">
                      Số điện thoại
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại..."
                      className="border-0 bg-light rounded-3 px-3 py-2"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Nút Lưu thay đổi */}
              <div className="mt-4">
                <Button
                  type="submit"
                  variant="danger"
                  className="d-inline-flex align-items-center gap-2 rounded-pill px-4 py-2 fw-bold shadow-sm"
                  disabled={loadingSave}
                >
                  {loadingSave ? <Spinner animation="border" size="sm" /> : <FaSave />} Lưu thay đổi
                </Button>
              </div>
            </Form>

            <hr className="my-5 border-light" />

            {/* Nút Thay đổi mật khẩu */}
            <div>
              <h5 className="fw-bold mb-3">Bảo mật</h5>
              <Button
                variant={showChangePassword ? 'secondary' : 'outline-danger'}
                onClick={handleTogglePassword}
                className="d-inline-flex align-items-center gap-2 rounded-pill px-4 py-2 fw-bold shadow-sm"
                style={{ width: 'fit-content' }}
              >
                <FaKey />
                {showChangePassword ? 'Hủy đổi mật khẩu' : 'Thay đổi mật khẩu'}
              </Button>
            </div>

            {/* Thông báo */}
            {passwordMsg && (
              <div className="alert alert-success py-2 mt-4 mb-0 rounded-3 border-0">{passwordMsg}</div>
            )}
            {passwordError && (
              <div className="alert alert-danger py-2 mt-4 mb-0 rounded-3 border-0">{passwordError}</div>
            )}

            {showChangePassword && (
              <div className="mt-4 p-4 bg-light rounded-4">
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-muted small text-uppercase">
                        Mật khẩu cũ
                      </Form.Label>
                      <Form.Control
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Nhập mật khẩu hiện tại..."
                        className="border-0 rounded-3 px-3 py-2"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-muted small text-uppercase">
                        Mật khẩu mới
                      </Form.Label>
                      <Form.Control
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới..."
                        className="border-0 rounded-3 px-3 py-2"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-muted small text-uppercase">
                        Xác nhận mật khẩu
                      </Form.Label>
                      <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới..."
                        className="border-0 rounded-3 px-3 py-2"
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12} className="mt-4">
                    <Button
                      variant="danger"
                      className="d-inline-flex align-items-center gap-2 rounded-pill px-4 py-2 fw-bold shadow-sm"
                      onClick={handleChangePassword}
                      disabled={loadingPassword}
                    >
                      {loadingPassword ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <FaSave />
                      )}
                      Lưu mật khẩu mới
                    </Button>
                  </Col>
                </Row>
              </div>
            )}
              </Card>
            </Tab>

            <Tab eventKey="address" title={<><FaMapMarkerAlt className="me-2" />Địa chỉ</>}>
              <Card className="border-0 shadow-sm p-4 rounded-4 rounded-top-0">
                <AddressBook />
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};

export default ProfileScreen;
