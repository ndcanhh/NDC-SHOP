import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import Product from '../components/Product';
import { FaArrowLeft, FaStar, FaBolt, FaFire } from 'react-icons/fa';

// Cấu hình tiêu đề & biểu tượng theo từng loại danh mục
const categoryConfig = {
  all: { title: 'Tất cả Điện thoại', icon: <FaStar className="text-warning" />, filter: () => true },
  new: { title: 'Điện thoại Mới', icon: <FaBolt className="text-success" />, filter: (p) => (p.tags || []).some(t => t.toLowerCase().includes('mới')) },
  hot: { title: 'Điện thoại Hot', icon: <FaFire className="text-danger" />, filter: (p) => (p.tags || []).some(t => t.toLowerCase().includes('hot')) },
};

const ProductCategoryScreen = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State quản lý bộ lọc Hãng
  const [selectedBrand, setSelectedBrand] = useState('All');

  const config = categoryConfig[category] || categoryConfig.all;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products');
        setProducts(data);
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau!');
        console.error(err);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Lọc theo danh mục (all / new / hot)
  const categoryProducts = products.filter(config.filter);

  // Lấy danh sách hãng duy nhất từ danh mục
  const brands = ['All', ...new Set(categoryProducts.map(p => p.brand))];

  // Lọc tiếp theo hãng
  const filteredProducts = selectedBrand === 'All'
    ? categoryProducts
    : categoryProducts.filter(p => p.brand === selectedBrand);

  return (
    <>
      <Link className="btn btn-light my-3 border shadow-sm d-inline-flex align-items-center gap-2" to="/">
        <FaArrowLeft /> Quay lại trang chủ
      </Link>

      <h3 className="mb-3 ps-2 border-start border-danger border-4 fw-bold d-flex align-items-center gap-2">
        {config.icon}
        {config.title}
      </h3>

      {/* Bộ lọc Hãng sản xuất */}
      {!loading && !error && categoryProducts.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-4">
          {brands.map(brand => (
            <button
              key={brand}
              className={`btn ${selectedBrand === brand ? 'btn-danger' : 'btn-outline-danger'} rounded-pill px-4 fw-semibold shadow-sm`}
              onClick={() => setSelectedBrand(brand)}
              style={{ transition: 'all 0.3s ease' }}
            >
              {brand === 'All' ? 'Tất cả' : brand}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-2 text-muted">Đang tải sản phẩm...</p>
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center">{error}</Alert>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-5 w-100">
          <h5 className="text-muted">Không tìm thấy sản phẩm nào.</h5>
        </div>
      ) : (
        <>
          <p className="text-muted mb-3">Hiển thị <strong>{filteredProducts.length}</strong> sản phẩm</p>
          <Row className="g-2">
            {filteredProducts.map((product) => (
              <Col key={product._id} sm={6} md={6} lg={4} xl={3} className="d-flex align-items-stretch py-1">
                <Product product={product} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </>
  );
};

export default ProductCategoryScreen;
