import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Card, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { CartContext } from '../context/cartContextDef';

const ProductScreen = () => {
  const { id: productId } = useParams();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Gọi hàm addToCart từ Thủ kho
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${productId}`);
        setProduct(data); 
      } catch (err) {
        setError('Không tìm thấy sản phẩm hoặc đã có lỗi xảy ra!');
        console.error('Lỗi khi tải chi tiết sản phẩm:', err);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId]);

  // Hàm xử lý khi khách bấm nút "Thêm vào giỏ hàng" từ trang Chi tiết
  const handleAddToCart = () => {
    // Nhét nguyên cục product này vào Giỏ
    addToCart(product);
    // Xong tự động chuyển họ sang trang xem Giỏ hàng (Cart)
    navigate('/cart');
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
          <Image src={product.image} alt={product.name} fluid className="rounded shadow-sm" />
        </Col>

        <Col md={4}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h3>{product.name}</h3>
            </ListGroup.Item>
            <ListGroup.Item>
                <span className="text-brand-red fw-bold fs-3">{product.price?.toLocaleString('vi-VN')} đ</span>
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
                    <strong className="text-brand-red">{product.price?.toLocaleString('vi-VN')} đ</strong>
                  </Col>
                </Row>
              </ListGroup.Item>
              
              <ListGroup.Item>
                <Row>
                  <Col>Trạng thái:</Col>
                  <Col>
                    {product.countInStock > 0 ? (
                        <span className="text-success fw-bold">Còn hàng</span>
                    ) : (
                        <span className="text-danger fw-bold">Hết hàng</span>
                    )}
                  </Col>
                </Row>
              </ListGroup.Item>
              
              <ListGroup.Item>
                <Button
                  className="w-100 buy-btn py-2"
                  type="button"
                  disabled={product.countInStock === 0}
                  onClick={handleAddToCart}
                >
                  Thêm vào giỏ hàng
                </Button>
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
