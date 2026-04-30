import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card, Table, Spinner, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaExchangeAlt, FaCheck, FaTimes } from 'react-icons/fa';

const CompareScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [product1Id, setProduct1Id] = useState(sessionStorage.getItem('compare_p1') || '');
  const [product2Id, setProduct2Id] = useState(sessionStorage.getItem('compare_p2') || '');
  const [searchTerm1, setSearchTerm1] = useState(sessionStorage.getItem('compare_s1') || '');
  const [searchTerm2, setSearchTerm2] = useState(sessionStorage.getItem('compare_s2') || '');

  // Lưu trạng thái vào sessionStorage để khi ấn nút Back trình duyệt, dữ liệu không bị mất
  useEffect(() => {
    sessionStorage.setItem('compare_p1', product1Id);
  }, [product1Id]);

  useEffect(() => {
    sessionStorage.setItem('compare_p2', product2Id);
  }, [product2Id]);

  useEffect(() => {
    sessionStorage.setItem('compare_s1', searchTerm1);
  }, [searchTerm1]);

  useEffect(() => {
    sessionStorage.setItem('compare_s2', searchTerm2);
  }, [searchTerm2]);
  const [showSuggestions1, setShowSuggestions1] = useState(false);
  const [showSuggestions2, setShowSuggestions2] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products');
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau!');
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const product1 = products.find((p) => p._id === product1Id);
  const product2 = products.find((p) => p._id === product2Id);

  // Helper to format price
  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + ' đ';
  };

  // Helper to calculate discounted price
  const getDiscountedPrice = (price, discount) => {
    return price - (price * (discount / 100));
  };

  const filteredProducts1 = products.filter(p => p.name.toLowerCase().includes(searchTerm1.toLowerCase()));
  const filteredProducts2 = products.filter(p => p.name.toLowerCase().includes(searchTerm2.toLowerCase()));

  return (
    <Container className="my-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold d-flex align-items-center justify-content-center gap-2">
          <FaExchangeAlt className="text-danger" /> SO SÁNH SẢN PHẨM
        </h2>
        <p className="text-muted">Chọn 2 sản phẩm bên dưới để đối chiếu cấu hình và mức giá</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center">{error}</Alert>
      ) : (
        <>
          {/* Row chứa 2 ô chọn sản phẩm */}
          <Row className="mb-4 gx-lg-5">
            <Col md={6} className="mb-3 mb-md-0">
              <Card className="shadow-sm border-0 rounded-4 p-3 bg-light">
                <Form.Group className="position-relative">
                  <Form.Label className="fw-bold text-danger">Chọn sản phẩm 1</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập tên sản phẩm để tìm..."
                    value={searchTerm1}
                    onChange={(e) => {
                      setSearchTerm1(e.target.value);
                      setShowSuggestions1(true);
                    }}
                    onFocus={() => {
                      if (searchTerm1) setShowSuggestions1(true);
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions1(false), 200)}
                    className="mb-2 shadow-none border-danger form-control-lg"
                    style={{ borderRadius: '10px' }}
                  />
                  {showSuggestions1 && searchTerm1 && filteredProducts1.length > 0 && (
                    <div className="search-suggestions" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, marginTop: '-5px' }}>
                      {filteredProducts1.slice(0, 6).map((p) => (
                        <div
                          key={p._id}
                          className="search-suggestion-item"
                          onClick={() => {
                            setProduct1Id(p._id);
                            setSearchTerm1(p.name);
                            setShowSuggestions1(false);
                          }}
                        >
                          <img src={p.image} alt={p.name} className="suggestion-img" />
                          <div className="suggestion-info">
                            <div className="suggestion-name">{p.name}</div>
                            <div className="suggestion-price">{formatPrice(getDiscountedPrice(p.price, p.discount))}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Form.Group>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="shadow-sm border-0 rounded-4 p-3 bg-light">
                <Form.Group className="position-relative">
                  <Form.Label className="fw-bold text-primary">Chọn sản phẩm 2</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập tên sản phẩm để tìm..."
                    value={searchTerm2}
                    onChange={(e) => {
                      setSearchTerm2(e.target.value);
                      setShowSuggestions2(true);
                    }}
                    onFocus={() => {
                      if (searchTerm2) setShowSuggestions2(true);
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions2(false), 200)}
                    className="mb-2 shadow-none border-primary form-control-lg"
                    style={{ borderRadius: '10px' }}
                  />
                  {showSuggestions2 && searchTerm2 && filteredProducts2.length > 0 && (
                    <div className="search-suggestions" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, marginTop: '-5px' }}>
                      {filteredProducts2.slice(0, 6).map((p) => (
                        <div
                          key={p._id}
                          className="search-suggestion-item"
                          onClick={() => {
                            setProduct2Id(p._id);
                            setSearchTerm2(p.name);
                            setShowSuggestions2(false);
                          }}
                        >
                          <img src={p.image} alt={p.name} className="suggestion-img" />
                          <div className="suggestion-info">
                            <div className="suggestion-name">{p.name}</div>
                            <div className="suggestion-price text-danger">{formatPrice(getDiscountedPrice(p.price, p.discount))}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Form.Group>
              </Card>
            </Col>
          </Row>

          {/* Vùng hiển thị bảng so sánh (Chỉ hiện khi ít nhất 1 sp được chọn) */}
          {(product1 || product2) ? (
            <Card className="shadow border-0 rounded-4 overflow-hidden mb-5">
              <Table bordered hover responsive className="mb-0 text-center align-middle bg-white">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '20%', fontSize: '1.1rem' }} className="align-middle text-start ps-4">Thông số kỹ thuật</th>
                    <th style={{ width: '40%' }}>
                      {product1 ? (
                        <h5 className="fw-bold text-danger mb-0">{product1.name}</h5>
                      ) : <span className="text-muted fst-italic">Chưa chọn</span>}
                    </th>
                    <th style={{ width: '40%' }}>
                      {product2 ? (
                        <h5 className="fw-bold text-primary mb-0">{product2.name}</h5>
                      ) : <span className="text-muted fst-italic">Chưa chọn</span>}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Hình ảnh */}
                  <tr>
                    <td className="fw-semibold text-start ps-4">Hình ảnh</td>
                    <td className="py-4">
                      {product1 && (
                        <Link to={`/product/${product1._id}`}>
                          <img src={product1.image} alt={product1.name} style={{ width: '150px', height: '150px', objectFit: 'contain', transition: 'transform 0.3s' }} className="compare-img hover-zoom" />
                        </Link>
                      )}
                    </td>
                    <td className="py-4">
                      {product2 && (
                         <Link to={`/product/${product2._id}`}>
                          <img src={product2.image} alt={product2.name} style={{ width: '150px', height: '150px', objectFit: 'contain', transition: 'transform 0.3s' }} className="compare-img hover-zoom" />
                         </Link>
                      )}
                    </td>
                  </tr>

                  {/* Giá bán */}
                  <tr>
                    <td className="fw-semibold text-start ps-4">Giá bán</td>
                    <td>
                      {product1 && (
                        <div>
                          <div className="text-danger fw-bold fs-5 mb-1">
                            {formatPrice(getDiscountedPrice(product1.price, product1.discount))}
                          </div>
                          {product1.discount > 0 && (
                            <div className="text-muted text-decoration-line-through small">
                              {formatPrice(product1.price)}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {product2 && (
                        <div>
                          <div className="text-primary fw-bold fs-5 mb-1">
                            {formatPrice(getDiscountedPrice(product2.price, product2.discount))}
                          </div>
                          {product2.discount > 0 && (
                            <div className="text-muted text-decoration-line-through small">
                              {formatPrice(product2.price)}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* Hãng sản xuất */}
                  <tr>
                    <td className="fw-semibold text-start ps-4">Thương hiệu</td>
                    <td>
                      {product1 && (
                        <Badge bg="secondary" className="px-3 py-2 rounded-pill fs-6">{product1.brand}</Badge>
                      )}
                    </td>
                    <td>
                      {product2 && (
                        <Badge bg="secondary" className="px-3 py-2 rounded-pill fs-6">{product2.brand}</Badge>
                      )}
                    </td>
                  </tr>

                  {/* RAM */}
                  <tr>
                    <td className="fw-semibold text-start ps-4 text-secondary bg-light" colSpan={3}>CẤU HÌNH CHI TIẾT</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold text-start ps-4">Dung lượng RAM</td>
                    <td>{product1 ? (product1.specs?.ram || 'Đang cập nhật') : ''}</td>
                    <td>{product2 ? (product2.specs?.ram || 'Đang cập nhật') : ''}</td>
                  </tr>

                  {/* ROM */}
                  <tr>
                    <td className="fw-semibold text-start ps-4">Bộ nhớ trong (ROM)</td>
                    <td>{product1 ? (product1.specs?.rom || 'Đang cập nhật') : ''}</td>
                    <td>{product2 ? (product2.specs?.rom || 'Đang cập nhật') : ''}</td>
                  </tr>

                  {/* Chip */}
                  <tr>
                    <td className="fw-semibold text-start ps-4">Vi xử lý (CPU)</td>
                    <td>{product1 ? (product1.specs?.chip || 'Đang cập nhật') : ''}</td>
                    <td>{product2 ? (product2.specs?.chip || 'Đang cập nhật') : ''}</td>
                  </tr>

                  {/* Pin */}
                  <tr>
                    <td className="fw-semibold text-start ps-4">Dung lượng Pin</td>
                    <td>{product1 ? (product1.specs?.battery || 'Đang cập nhật') : ''}</td>
                    <td>{product2 ? (product2.specs?.battery || 'Đang cập nhật') : ''}</td>
                  </tr>

                  {/* Hành động */}
                  <tr>
                    <td className="fw-semibold text-start ps-4"></td>
                    <td className="py-4">
                      {product1 && (
                        <Link to={`/product/${product1._id}`} className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm">
                          Xem chi tiết
                        </Link>
                      )}
                    </td>
                    <td className="py-4">
                      {product2 && (
                        <Link to={`/product/${product2._id}`} className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
                          Xem chi tiết
                        </Link>
                      )}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          ) : (
             <div className="text-center py-5 bg-white rounded-4 shadow-sm border text-muted">
                <FaExchangeAlt size={50} className="mb-3 text-light" />
                <h5>Vui lòng chọn sản phẩm ở ô phía trên để bắt đầu so sánh!</h5>
             </div>
          )}
        </>
      )}
      
      <style>
        {`
          .hover-zoom:hover {
            transform: scale(1.05);
          }
          .table > :not(caption) > * > * {
            padding: 1rem 0.5rem;
          }
        `}
      </style>
    </Container>
  );
};

export default CompareScreen;
