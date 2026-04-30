import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import { CartContext } from '../context/cartContextDef';
import { FaCartPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Hàm tiện ích: Chọn màu sắc nổi bật cho các Tag phổ biến
const getBadgeVariant = (tag) => {
  const lowerTag = tag.toLowerCase();
  if (lowerTag.includes('hot')) return 'danger';
  if (lowerTag.includes('mới')) return 'success';
  if (lowerTag.includes('gaming')) return 'purple';
  if (lowerTag.includes('pin trâu')) return 'warning';
  if (lowerTag.includes('giá rẻ')) return 'info';
  return 'secondary';
};

const ProductScreen = () => {
  const { id: productId } = useParams();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Biến thể đang chọn
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);

  // Gọi hàm addToCart từ Thủ kho
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${productId}`);
        setProduct(data);
        // Tự động chọn biến thể đầu tiên nếu có
        if (data.colorVariants && data.colorVariants.length > 0) {
          setSelectedColor(data.colorVariants[0]);
        }
        if (data.storageVariants && data.storageVariants.length > 0) {
          setSelectedStorage(data.storageVariants[0]);
        }
      } catch (err) {
        setError('Không tìm thấy sản phẩm hoặc đã có lỗi xảy ra!');
        console.error('Lỗi khi tải chi tiết sản phẩm:', err);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId]);

  // Giá hiển thị: Ưu tiên biến thể ROM đang chọn, fallback về giá gốc
  const displayPrice = selectedStorage ? selectedStorage.price : product.price;

  // Tồn kho hiển thị: Ưu tiên biến thể ROM, fallback về tồn kho gốc
  const displayStock = selectedStorage ? selectedStorage.countInStock : product.countInStock;

  // Ảnh hiển thị: Ưu tiên biến thể màu, fallback về ảnh gốc
  const displayImage = selectedColor ? selectedColor.image : product.image;

  // Hàm xử lý khi khách bấm nút "Thêm vào giỏ hàng" từ trang Chi tiết
  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      price: displayPrice,
      image: displayImage,
      color: selectedColor?.color || null,
      storageLabel: selectedStorage?.label || null,
    };
    addToCart(cartItem);
    toast.success('Đã thêm ' + product.name + ' vào giỏ hàng!');
  };

  const handleBuyNow = () => {
    const cartItem = {
      ...product,
      price: displayPrice,
      image: displayImage,
      color: selectedColor?.color || null,
      storageLabel: selectedStorage?.label || null,
    };
    addToCart(cartItem);
    navigate('/checkout');
  };

  return (
    <>
      <Link className="btn btn-light my-3 border shadow-sm" to="/">
        Quay lại trang chủ
      </Link>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-2 text-muted">Đang tải sản phẩm...</p>
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center">{error}</Alert>
      ) : (
      
      <Row>
        <Col md={5}>
          <Image src={displayImage} alt={product.name} fluid className="rounded shadow-sm" />
        </Col>

        <Col md={4}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h3>{product.name}</h3>
              {product.tags && product.tags.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <Badge 
                      key={idx} 
                      bg={getBadgeVariant(tag)}
                      style={getBadgeVariant(tag) === 'purple' ? { backgroundColor: '#6f42c1', fontSize: '14px' } : { fontSize: '14px' }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </ListGroup.Item>

            {/* Bộ chọn Màu sắc */}
            {product.colorVariants && product.colorVariants.length > 0 && (
              <ListGroup.Item>
                <strong>Màu sắc:</strong>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {product.colorVariants.map((cv, idx) => (
                    <button
                      key={idx}
                      title={cv.color}
                      onClick={() => setSelectedColor(cv)}
                      className="border-0 p-0"
                      style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        backgroundColor: cv.colorCode,
                        cursor: 'pointer',
                        outline: selectedColor?._id === cv._id || selectedColor?.color === cv.color
                          ? '3px solid #dc3545' : '2px solid #ccc',
                        outlineOffset: '2px',
                        transition: 'outline 0.2s ease'
                      }}
                    />
                  ))}
                </div>
                {selectedColor && (
                  <small className="text-muted mt-1 d-block">Đã chọn: {selectedColor.color}</small>
                )}
              </ListGroup.Item>
            )}

            {/* Bộ chọn RAM/ROM */}
            {product.storageVariants && product.storageVariants.length > 0 && (
              <ListGroup.Item>
                <strong>Phiên bản:</strong>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {product.storageVariants.map((sv, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedStorage(sv)}
                      className={`btn btn-sm ${selectedStorage?.label === sv.label ? 'btn-danger' : 'btn-outline-secondary'}`}
                      style={{ borderRadius: '8px', minWidth: '120px', transition: 'all 0.2s ease' }}
                    >
                      <div className="fw-bold">{sv.label}</div>
                      <small>{sv.price?.toLocaleString('vi-VN')} đ</small>
                    </button>
                  ))}
                </div>
              </ListGroup.Item>
            )}

            <ListGroup.Item>
                <span className="text-brand-red fw-bold fs-3">{displayPrice?.toLocaleString('vi-VN')} đ</span>
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Đặc điểm nổi bật:</strong> <br/>
              {product.description}
            </ListGroup.Item>
            <ListGroup.Item>
                <strong>Cấu hình chi tiết:</strong>
                <ul className="mt-2">
                    <li>RAM: {product.specs?.ram}</li>
                    <li>ROM: {product.specs?.rom}</li>
                    <li>Chip xử lý: {product.specs?.chip}</li>
                    <li>Dung lượng pin: {product.specs?.battery}</li>
                </ul>
            </ListGroup.Item>
          </ListGroup>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0">
            <ListGroup variant="flush">
              <ListGroup.Item>
                <Row>
                  <Col>Giá:</Col>
                  <Col>
                    <strong className="text-brand-red">{displayPrice?.toLocaleString('vi-VN')} đ</strong>
                  </Col>
                </Row>
              </ListGroup.Item>
              
              <ListGroup.Item>
                <Row>
                  <Col>Trạng thái:</Col>
                  <Col>
                    {displayStock > 0 ? (
                        <span className="text-success fw-bold">Còn hàng ({displayStock})</span>
                    ) : (
                        <span className="text-danger fw-bold">Hết hàng</span>
                    )}
                  </Col>
                </Row>
              </ListGroup.Item>
              
              <ListGroup.Item>
                <div className="d-flex gap-2">
                  <Button 
                    variant="danger" 
                    className="buy-btn flex-grow-1 m-0 py-2" 
                    onClick={handleBuyNow} 
                    disabled={displayStock === 0}
                  >
                    {displayStock === 0 ? 'Hết hàng' : 'MUA NGAY'}
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    className="flex-shrink-0" 
                    style={{ width: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
                    onClick={handleAddToCart} 
                    disabled={displayStock === 0} 
                    title="Thêm vào giỏ hàng"
                  >
                    <FaCartPlus size={20} />
                  </Button>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
      )}
    </>
  );
};

export default ProductScreen;
