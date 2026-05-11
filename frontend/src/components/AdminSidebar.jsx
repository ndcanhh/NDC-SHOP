import React, { useContext } from 'react';
import { Nav, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { 
  FaBoxOpen, 
  FaClipboardList, 
  FaUsers, 
  FaChartBar, 
  FaTag, 
  FaEnvelope,
  FaHome,
  FaSignOutAlt
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContextValue';

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const logoutHandler = () => {
    logout();
    navigate('/');
    if (onClose) onClose();
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: <FaChartBar />, label: 'Dashboard' },
    { path: '/admin/productlist', icon: <FaBoxOpen />, label: 'Sản Phẩm' },
    { path: '/admin/orderlist', icon: <FaClipboardList />, label: 'Đơn Hàng' },
    { path: '/admin/userlist', icon: <FaUsers />, label: 'Khách Hàng' },
    { path: '/admin/couponlist', icon: <FaTag />, label: 'Mã Giảm Giá' },
    { path: '/admin/contactlist', icon: <FaEnvelope />, label: 'Tin nhắn' },
  ];

  return (
    <aside className={`admin-sidebar shadow d-flex flex-column ${isOpen ? 'show' : ''}`} aria-label="Thanh điều hướng quản trị">
      <div className="sidebar-header p-4 text-center">
        <div onClick={() => window.location.reload()} style={{ cursor: 'pointer' }}>
          <h4 className="fw-bold text-white mb-0" style={{ textWrap: 'balance' }}>NDC SHOP</h4>
        </div>
      </div>

      <Nav className="flex-column px-2 py-3" as="nav">
        {menuItems.map((item) => (
          <LinkContainer key={item.path} to={item.path} onClick={onClose}>
            <Nav.Link 
              className={`sidebar-link d-flex align-items-center ${location.pathname === item.path ? 'active' : ''}`}
              aria-label={item.label}
            >
              <span className="sidebar-icon me-3" aria-hidden="true" style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span className="sidebar-label fw-medium">{item.label}</span>
            </Nav.Link>
          </LinkContainer>
        ))}
      </Nav>

      <div className="px-3 pb-4 mt-4">
        <Button 
          className="w-100 d-flex align-items-center justify-content-center gap-2 border-0 sidebar-logout-btn"
          onClick={logoutHandler}
          style={{ 
            borderRadius: '12px', 
            padding: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#ff4d4f',
            fontFamily: "'Inter', sans-serif",
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#d70018';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#ff4d4f';
          }}
        >
          <FaSignOutAlt /> <span className="fw-bold">Đăng xuất</span>
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
