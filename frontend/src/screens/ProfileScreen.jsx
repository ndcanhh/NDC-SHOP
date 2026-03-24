import React, { useContext, useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaSave, FaKey } from 'react-icons/fa';
import { AuthContext } from '../context/authContextValue';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
        <Col md={3} className="text-center">
          <Card className="border-0 shadow-sm p-4">
            <div className="avatar-circle mx-auto mb-3">
              <FaUser size={48} className="text-white" />
            </div>
            <h5 className="fw-bold mb-1">{userInfo?.name}</h5>
            <p className="text-muted small mb-0">{userInfo?.email}</p>
            {userInfo?.role === 'admin' && (
              <span className="badge bg-danger mt-2">Quản trị viên</span>
            )}
          </Card>
        </Col>

        {/* Cột phải: Form chỉnh sửa thông tin */}
        <Col md={9}>
          <Card className="border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-4">Chỉnh sửa thông tin</h5>

            {saved && (
              <div className="alert alert-success py-2">
                Lưu thông tin thành công!
              </div>
            )}

            {saveError && (
              <div className="alert alert-danger py-2">
                {saveError}
              </div>
            )}

            <Form onSubmit={handleSave}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                      <FaUser className="text-danger" /> Họ và tên
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập họ và tên..."
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                      <FaEnvelope className="text-danger" /> Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập email..."
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                      <FaPhone className="text-danger" /> Số điện thoại
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại..."
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Nút Lưu thay đổi — nhỏ, góc trái */}
              <div className="mt-4">
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  className="d-flex align-items-center gap-2"
                  disabled={loadingSave}
                >
                  {loadingSave ? <Spinner animation="border" size="sm" /> : <FaSave />} Lưu thay đổi
                </Button>
              </div>
            </Form>

            {/* Đường kẻ phân cách */}
            <hr className="my-4" />

            {/* Nút Thay đổi mật khẩu */}
            <Button
              variant={showChangePassword ? 'outline-secondary' : 'outline-danger'}
              size="sm"
              onClick={handleTogglePassword}
              className="d-flex align-items-center gap-2"
            >
              <FaKey />
              {showChangePassword ? 'Hủy đổi mật khẩu' : 'Thay đổi mật khẩu'}
            </Button>

            {/* Thông báo */}
            {passwordMsg && (
              <div className="alert alert-success py-2 mt-3 mb-0">{passwordMsg}</div>
            )}
            {passwordError && (
              <div className="alert alert-danger py-2 mt-3 mb-0">{passwordError}</div>
            )}

            {/* 3 ô mật khẩu hiện ra khi bấm nút */}
            {showChangePassword && (
              <Row className="g-3 mt-2">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                      <FaLock className="text-danger" /> Mật khẩu cũ
                    </Form.Label>
                    <Form.Control
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại..."
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                      <FaLock className="text-danger" /> Mật khẩu mới
                    </Form.Label>
                    <Form.Control
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới..."
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                      <FaLock className="text-danger" /> Xác nhận mật khẩu mới
                    </Form.Label>
                    <Form.Control
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới..."
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Button
                    variant="danger"
                    size="sm"
                    className="d-flex align-items-center gap-2"
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
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfileScreen;
