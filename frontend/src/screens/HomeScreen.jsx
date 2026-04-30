import React, { useEffect, useState, useMemo } from 'react';
import { Row, Col, Carousel, Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Product from '../components/Product';
import { FaStar, FaBolt, FaFire } from 'react-icons/fa';

// Hàm trộn ngẫu nhiên mảng (Fisher-Yates Shuffle)
const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Số sản phẩm mỗi hàng (4 cột xl) x 2 hàng = 8 sản phẩm
const ITEMS_PER_SECTION = 8;

// Component tái sử dụng cho mỗi Section (Khai báo bên ngoài để tránh re-create mỗi lần render)
const ProductSection = ({ title, icon, products: sectionProducts, linkTo, accentColor }) => (
  <div className="mb-5">
    <div className="mb-3">
      <h3 className="mb-0 ps-2 border-start border-4 fw-bold d-flex align-items-center gap-2" style={{ borderColor: `${accentColor} !important` }}>
        {icon}
        {title}
      </h3>
    </div>

    {sectionProducts.length === 0 ? (
      <div className="text-center py-4">
        <p className="text-muted">Chưa có sản phẩm nào trong danh mục này.</p>
      </div>
    ) : (
      <>
        <Row className="g-2">
          {sectionProducts.map((product) => (
            <Col key={product._id} sm={6} md={6} lg={4} xl={3} className="d-flex align-items-stretch py-1">
              <Product product={product} />
            </Col>
          ))}
        </Row>
        {linkTo && (
          <div className="text-center mt-3">
            <Link to={linkTo} className="btn btn-outline-danger rounded-pill px-5 fw-semibold shadow-sm">
              Xem tất cả →
            </Link>
          </div>
        )}
      </>
    )}
  </div>
);

const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products');
        setProducts(data);
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau!');
        console.error('Lỗi khi tải danh sách sản phẩm:', err);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Phân loại sản phẩm theo tag
  const featuredProducts = useMemo(() => shuffleArray(products).slice(0, ITEMS_PER_SECTION), [products]);

  const newProducts = useMemo(() => {
    return products.filter(p => (p.tags || []).some(t => t.toLowerCase().includes('mới'))).slice(0, ITEMS_PER_SECTION);
  }, [products]);

  const hotProducts = useMemo(() => {
    return products.filter(p => (p.tags || []).some(t => t.toLowerCase().includes('hot'))).slice(0, ITEMS_PER_SECTION);
  }, [products]);

  return (
    <>
      {/* Banner Khuyến Mãi */}
      <div style={{ width: '75%', margin: '0 auto' }}>
        <Carousel className="mb-4 shadow-sm promo-carousel" style={{ borderRadius: '15px', overflow: 'hidden' }}>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="/image/690x300_iPhone 17 Pro Max_02.2026.webp"
              alt="Khuyến mãi iPhone"
              style={{ objectFit: 'cover' }}
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="/image/oppo-reno15-home-0225.webp"
              alt="Khuyến mãi Oppo"
              style={{ objectFit: 'cover' }}
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="/image/Xiaomi17ultra_home.webp"
              alt="Khuyến mãi Xiaomi"
              style={{ objectFit: 'cover' }}
            />
          </Carousel.Item>
        </Carousel>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-2 text-muted">Đang tải sản phẩm...</p>
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center">{error}</Alert>
      ) : (
        <>
          {/* 1. ĐIỆN THOẠI NỔI BẬT (Random) */}
          <ProductSection
            title="ĐIỆN THOẠI NỔI BẬT"
            icon={<FaStar className="text-warning" />}
            products={featuredProducts}
            linkTo="/products/all"
            accentColor="#dc3545"
          />

          {/* 2. ĐIỆN THOẠI MỚI (Tag "Mới") */}
          {newProducts.length > 0 && (
            <ProductSection
              title="ĐIỆN THOẠI MỚI"
              icon={<FaBolt className="text-success" />}
              products={newProducts}
              linkTo="/products/new"
              accentColor="#198754"
            />
          )}

          {/* 3. ĐIỆN THOẠI HOT (Tag "Hot") */}
          {hotProducts.length > 0 && (
            <ProductSection
              title="ĐIỆN THOẠI HOT"
              icon={<FaFire className="text-danger" />}
              products={hotProducts}
              linkTo="/products/hot"
              accentColor="#dc3545"
            />
          )}
        </>
      )}
    </>
  );
};

export default HomeScreen;
