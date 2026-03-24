import React, { useEffect, useState } from 'react';
import { Row, Col, Carousel, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import Product from '../components/Product';

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

  return (
    <>
      {/* Banner Khuyến Mãi — thu nhỏ chiều ngang ~75%, căn giữa */}
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

      <h3 className="mb-3 ps-2 border-start border-danger border-4 fw-bold">ĐIỆN THOẠI NỔI BẬT</h3>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-2 text-muted">Đang tải sản phẩm...</p>
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center">{error}</Alert>
      ) : (
        <Row className="g-2">
          {products.map((product) => (
            <Col key={product._id} sm={6} md={6} lg={4} xl={3} className="d-flex align-items-stretch py-1">
              <Product product={product} />
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default HomeScreen;
