// Trang Kết quả Tìm kiếm — hiển thị danh sách sản phẩm khớp với từ khóa
// URL: /search?keyword=iphone

import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import Product from '../components/Product';
import { FaSearch, FaArrowLeft } from 'react-icons/fa';

const SearchScreen = () => {
  // useSearchParams đọc query string từ URL, ví dụ: /search?keyword=iphone → keyword = "iphone"
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API tìm kiếm khi trang load hoặc keyword thay đổi
  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        // Gọi API: /api/products/search?keyword=... (không giới hạn 6 kết quả ở đây)
        const { data } = await axios.get(`/api/products/search?keyword=${encodeURIComponent(keyword)}`);
        setProducts(data);
      } catch (error) {
        console.error('Lỗi tìm kiếm:', error);
      }
      setLoading(false);
    };

    if (keyword) {
      fetchSearchResults();
    }
  }, [keyword]);

  return (
    <>
      {/* Nút quay lại + tiêu đề */}
      <Link className="btn btn-light my-3 border shadow-sm d-inline-flex align-items-center gap-2" to="/">
        <FaArrowLeft /> Quay lại trang chủ
      </Link>

      <h3 className="mb-3 ps-2 border-start border-danger border-4 fw-bold d-flex align-items-center gap-2">
        <FaSearch className="text-danger" />
        Kết quả tìm kiếm: "{keyword}"
      </h3>

      {/* Trạng thái Loading */}
      {loading ? (
        <p className="text-center text-muted py-5">🔍 Đang tìm kiếm...</p>
      ) : products.length === 0 ? (
        // Không tìm thấy kết quả
        <Alert variant="warning" className="text-center py-4">
          <h5>Không tìm thấy sản phẩm nào cho "{keyword}"</h5>
          <p className="mb-0">Hãy thử tìm với từ khóa khác, ví dụ: iPhone, Samsung, Xiaomi...</p>
        </Alert>
      ) : (
        // Hiển thị danh sách sản phẩm tìm được
        <>
          <p className="text-muted mb-3">Tìm thấy <strong>{products.length}</strong> sản phẩm</p>
          <Row>
            {products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3} className="d-flex align-items-stretch">
                <Product product={product} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </>
  );
};

export default SearchScreen;
