import React, { useContext, useState, useEffect, useRef } from 'react';
import { Container, Navbar, Nav, Form, FormControl, Badge, NavDropdown } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaSearch, FaPhoneAlt, FaMapMarkerAlt, FaFire, FaBars, FaInfoCircle, FaEnvelope, FaNewspaper, FaIdCard, FaSignOutAlt, FaBox, FaUserShield, FaExchangeAlt, FaGlobe } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/cartContextDef';
import { AuthContext } from '../context/authContextValue';

// resize ảnh nhỏ cho gợi ý tìm kiếm (60x60px)
const optimizeUrl = (url, w = 60, h = 60) => {
    if (!url || !url.includes('cloudinary')) return url;
    return url.replace('/upload/', `/upload/c_fill,w_${w},h_${h},q_auto,f_auto/`);
};

const Header = () => {
  const { cartItems } = useContext(CartContext);
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // STATE CHO TÌM KIẾM 
  const [searchKeyword, setSearchKeyword] = useState(''); 
  const [suggestions, setSuggestions] = useState([]);        
  const [showSuggestions, setShowSuggestions] = useState(false); 
  const searchRef = useRef(null); 

  // Chờ người dùng ngừng gõ 300ms rồi mới gọi 1 lần
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchKeyword.trim().length < 2) {
        setSuggestions([]);        
        setShowSuggestions(false);
        return;
      }

      try {
        const { data } = await axios.get(`/api/products/search?keyword=${encodeURIComponent(searchKeyword)}&limit=6`);
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Lỗi tìm kiếm:', error);
      }
    }, 300); 

    return () => clearTimeout(timer); 
  }, [searchKeyword]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // click vào 1 gợi ý → chuyển tới trang chi tiết sản phẩm đó
  const handleSelectSuggestion = (productId) => {
    setShowSuggestions(false);
    setSearchKeyword('');
    navigate(`/product/${productId}`);
  };

  const logoutHandler = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
      logout();
    }
  };

  return (
    <>
      {/* Thanh Top Bar */}
      <div className="topbar py-1 d-none d-lg-block" style={{ fontSize: '0.8rem' }}>
        <Container className="d-flex justify-content-between align-items-center px-5">
          
          <div className="fw-bold d-flex align-items-center gap-1 marquee-container" style={{ flex: 1, marginRight: '20px' }}>
            <FaFire className="text-warning" />
            <div className="marquee-track">
              <span className="marquee-text">
                Siêu Sales Tháng 3 - Giảm giá điện thoại đến 50% | Miễn phí giao hàng toàn quốc | Trả góp 0% lãi suất | Tặng phụ kiện chính hãng khi mua Online | Bảo hành 24 tháng&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              <span className="marquee-text">
                Siêu Sales Tháng 3 - Giảm giá điện thoại đến 50% | Miễn phí giao hàng toàn quốc | Trả góp 0% lãi suất | Tặng phụ kiện chính hãng khi mua Online | Bảo hành 24 tháng&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </div>
          </div>

          <div className="d-flex gap-4 fw-bold align-items-center" style={{ fontSize: '0.8rem' }}>
            <div 
              className="text-white d-flex align-items-center gap-1" 
              style={{ cursor: 'help', opacity: 0.9 }} 
              title="Tính năng đa ngôn ngữ sẽ được hoàn thiện trong phiên bản tiếp theo"
            >
              <FaGlobe size={11} /> Tiếng Việt
            </div>
            <a href="#" className="text-white text-decoration-none d-flex align-items-center gap-1">
              <FaPhoneAlt size={11} /> 0973521509
            </a>
            <a href="#" className="text-white text-decoration-none d-flex align-items-center gap-1">
              <FaMapMarkerAlt size={11} /> 70 ngõ 176 Trương Định, Hai Bà Trưng, Hà Nội
            </a>
          </div>
        </Container>
      </div>

      {/*Thanh Navbar */}
      <Navbar className="bg-brand-red custom-navbar shadow-sm" variant="dark" expand="lg">
        <Container>
          {/* Logo Text */}
          <LinkContainer to="/">
            <Navbar.Brand className="me-5 ms-5 py-0 text-white fw-bold" style={{ fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
                NDC SHOP
            </Navbar.Brand>
          </LinkContainer>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            
            {/* Thanh Search — có dropdown gợi ý */}
            <div className="search-bar-container mx-auto my-3 my-lg-0 position-relative" style={{ maxWidth: '480px', width: '100%' }} ref={searchRef}>
                <Form className="d-flex position-relative align-items-center" onSubmit={(e) => {
                    e.preventDefault();
                    if (searchKeyword.trim()) {
                      setShowSuggestions(false);
                      navigate(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
                    }
                }}>
                    <FormControl
                        type="search"
                        placeholder="Nhập từ khóa tìm kiếm ..."
                        className="search-input w-100 rounded-pill px-4 py-2 border-0 shadow-none bg-white"
                        aria-label="Search"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        style={{ paddingRight: '50px' }}
                    />
                    <button type="submit" className="search-btn rounded-circle d-flex align-items-center justify-content-center border-0 bg-danger text-white position-absolute shadow-sm" aria-label="Tìm kiếm" style={{ right: '6px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px' }}>
                      <FaSearch size={14} />
                    </button>
                </Form>

                {/* Dropdown gợi ý tìm kiếm */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="search-suggestions shadow-lg rounded-4 overflow-hidden border-0 mt-2">
                    {suggestions.map((product) => (
                      <div
                        key={product._id}
                        className="search-suggestion-item"
                        onClick={() => handleSelectSuggestion(product._id)}
                      >
                        <img src={optimizeUrl(product.image)} alt={product.name} className="suggestion-img" />
                        <div className="suggestion-info">
                          <div className="suggestion-name">{product.name}</div>
                          <div className="suggestion-price">{product.price.toLocaleString('vi-VN')} đ</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            <Nav className="ms-auto align-items-center gap-2 flex-row flex-wrap justify-content-center mt-3 mt-lg-0">
              {/* Nút Giỏ hàng */}
              <LinkContainer to="/cart">
                <Nav.Link className="text-white header-btn position-relative d-flex align-items-center gap-2">
                  <FaShoppingCart size={20} /> 
                  <span className="d-none d-lg-block" style={{ fontSize: '0.85rem' }}>Giỏ hàng</span>
                  
                  {cartItems.length > 0 && (
                    <Badge pill bg="warning" text="dark" className="position-absolute top-0 start-100 translate-middle border border-2 border-white shadow-sm" style={{ transform: 'translate(-30%, -30%)' }}>
                      {cartItems.reduce((total, item) => total + (item.qty || 1), 0)}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>

              {/* Nút So sánh */}
              <LinkContainer to="/compare">
                <Nav.Link className="text-white header-btn position-relative d-flex align-items-center gap-2">
                  <FaExchangeAlt size={20} /> 
                  <span className="d-none d-lg-block" style={{ fontSize: '0.85rem' }}>So sánh</span>
                </Nav.Link>
              </LinkContainer>
              
              {/* Nút Người dùng */}
              {userInfo ? (
                <NavDropdown 
                    title={
                      <span className="text-white d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                        <FaUser size={18} /> 
                        <span className="d-none d-lg-block">{userInfo.name}</span>
                      </span>
                    } 
                    id="username" 
                    className="header-btn user-dropdown"
                >
                  <LinkContainer to="/profile">
                    <NavDropdown.Item className="d-flex align-items-center gap-2">
                      <FaIdCard className="text-danger" /> Hồ sơ cá nhân
                    </NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/orders">
                    <NavDropdown.Item className="d-flex align-items-center gap-2">
                      <FaBox className="text-danger" /> Đơn hàng của tôi
                    </NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutHandler} className="d-flex align-items-center gap-2">
                    <FaSignOutAlt className="text-danger" /> Đăng xuất
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link className="text-white header-btn d-flex align-items-center gap-2">
                    <FaUser size={20} />
                    <span className="d-none d-lg-block" style={{ fontSize: '0.85rem' }}>Đăng nhập</span>
                  </Nav.Link>
                </LinkContainer>
              )}

              {/* Dropdown Menu dành cho Admin */}
              {userInfo && userInfo.isAdmin && (
                <NavDropdown 
                    title={
                      <span className="text-white d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                        <FaUserShield size={18} /> 
                        <span className="d-none d-lg-block">Admin</span>
                      </span>
                    } 
                    id="adminmenu" 
                    className="header-btn user-dropdown"
                >
                  <LinkContainer to="/admin/dashboard">
                    <NavDropdown.Item>Bảng điều khiển (Dashboard)</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/productlist">
                    <NavDropdown.Item>Quản lý Sản phẩm</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/orderlist">
                    <NavDropdown.Item>Quản lý Đơn hàng</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/userlist">
                    <NavDropdown.Item>Quản lý Khách hàng</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}

              {/* Dropdown Menu: Giới thiệu, Liên hệ, Tin tức */}
              <NavDropdown 
                  title={
                    <span className="text-white d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                      <FaBars size={18} /> 
                      <span className="d-none d-lg-block">Danh mục</span>
                    </span>
                  } 
                  id="menu-dropdown" 
                  className="header-btn menu-dropdown"
              >
                <LinkContainer to="/about">
                  <NavDropdown.Item className="d-flex align-items-center gap-2">
                    <FaInfoCircle className="text-danger" /> Giới thiệu
                  </NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/contact">
                  <NavDropdown.Item className="d-flex align-items-center gap-2">
                    <FaEnvelope className="text-danger" /> Liên hệ
                  </NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/news">
                  <NavDropdown.Item className="d-flex align-items-center gap-2">
                    <FaNewspaper className="text-danger" /> Tin tức
                  </NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>

            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
