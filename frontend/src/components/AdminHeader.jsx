import React, { useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaUserShield, FaSignOutAlt, FaBoxOpen, FaClipboardList, FaUsers, FaChartBar, FaTag, FaEnvelope, FaNewspaper } from 'react-icons/fa';
import { AuthContext } from '../context/authContextValue';
import { useNavigate } from 'react-router-dom';

const AdminHeader = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const logoutHandler = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar className="bg-brand-red custom-navbar shadow-sm" variant="dark" expand="lg">
      <Container fluid>
        <LinkContainer to="/admin/dashboard">
          <Navbar.Brand className="fw-bold fs-4 text-white" style={{ letterSpacing: '1px' }}>
            NDC SHOP ADMIN
          </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="me-auto ms-4 text-uppercase fw-bold" style={{ fontSize: '0.9rem' }}>
            <LinkContainer to="/admin/dashboard">
              <Nav.Link className="px-3"><FaChartBar className="me-1 mb-1"/> Bảng Điều Khiển</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/admin/productlist">
              <Nav.Link className="px-3"><FaBoxOpen className="me-1 mb-1"/> Sản Phẩm</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/admin/orderlist">
              <Nav.Link className="px-3"><FaClipboardList className="me-1 mb-1"/> Đơn Hàng</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/admin/userlist">
              <Nav.Link className="px-3"><FaUsers className="me-1 mb-1"/> Khách Hàng</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/admin/couponlist">
              <Nav.Link className="px-3"><FaTag className="me-1 mb-1"/> Mã Giảm Giá</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/admin/contactlist">
              <Nav.Link className="px-3"><FaEnvelope className="me-1 mb-1"/> Tin nhắn</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/admin/newslist">
              <Nav.Link className="px-3"><FaNewspaper className="me-1 mb-1"/> Tin tức</Nav.Link>
            </LinkContainer>
          </Nav>
          <Nav>
            {userInfo && (
              <NavDropdown 
                title={<span className="fw-bold text-white"><FaUserShield className="me-1"/> {userInfo.name}</span>} 
                id="admin-username"
                align="end"
              >

                <NavDropdown.Item onClick={logoutHandler} className="text-danger fw-bold">
                  <FaSignOutAlt className="me-1"/> Đăng xuất
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminHeader;
