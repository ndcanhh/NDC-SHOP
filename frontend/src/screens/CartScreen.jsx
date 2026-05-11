import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa';
import { CartContext } from '../context/cartContextDef';
import { AuthContext } from '../context/authContextValue';
import { optimizeCloudinaryUrl } from '../utils/imageUtils';
import { toast } from 'react-toastify';


const CartScreen = () => {
  // Lấy danh sách sản phẩm và các hàm xử lý từ Context
  const { cartItems, updateQty, removeFromCart } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  // Tổng số lượng sản phẩm (cộng tất cả qty)
  const totalQty = cartItems.reduce((acc, item) => acc + (item.qty || 1), 0);

  // Tổng tiền = giá × số lượng từng món
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * (item.qty || 1), 0);

  // Hàm tăng số lượng — báo lỗi nếu đã đạt giới hạn tồn kho
  const handleIncreaseQty = (item) => {
    if (item.qty >= item.countInStock) {
      toast.error(`Chỉ còn ${item.countInStock} sản phẩm trong kho!`);
      return;
    }
    updateQty(item._id, item.qty + 1, item.color, item.storageLabel);
  };

  return (
    <Row>
      <Col md={8}>
        <h2 className="mb-4 text-brand-red fw-bold">Giỏ hàng của bạn</h2>
        
        {/* Kiểm tra giỏ hàng có trống không */}
        {cartItems.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-4 text-center py-5 px-4 empty-cart-card">
            <div className="empty-cart-icon-wrapper mb-4 mx-auto">
              <FaShoppingCart size={80} className="text-muted opacity-25" />
            </div>
            <h3 className="fw-bold mb-2">Giỏ hàng của bạn đang trống!</h3>
            <p className="text-muted mb-4">
              Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.<br />
              Hãy khám phá hàng ngàn sản phẩm công nghệ hấp dẫn ngay nhé!
            </p>
            <Link to="/">
              <Button className="buy-btn rounded-pill px-5 py-2 fw-bold shadow-sm">
                ĐI MUA SẮM NGAY
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <ListGroup variant="flush">
            {cartItems.map((item, index) => (
              <ListGroup.Item key={`${item._id}_${item.color || ''}_${item.storageLabel || ''}_${index}`} className="p-3">
                <Row className="align-items-center text-center text-md-start">
                  {/* Ảnh sản phẩm */}
                  <Col md={2} className="mb-2 mb-md-0">
                    <Image src={optimizeCloudinaryUrl(item.image, 100, 100)} alt={item.name} fluid rounded />
                  </Col>
                  
                  {/* Tên sản phẩm + biến thể */}
                  <Col md={3} className="mb-2 mb-md-0">
                    <Link to={`/product/${item._id}`} className="text-dark text-decoration-none fw-bold">
                      {item.name}
                    </Link>
                    {(item.color || item.storageLabel) && (
                      <div className="mt-1">
                        {item.color && <small className="text-muted d-block">Màu: {item.color}</small>}
                        {item.storageLabel && <small className="text-muted d-block">Phiên bản: {item.storageLabel}</small>}
                      </div>
                    )}
                  </Col>
                  
                  {/* Đơn giá */}
                  <Col md={2} className="text-brand-red fw-bold text-center mb-2 mb-md-0">
                    {item.price.toLocaleString('vi-VN')} đ
                  </Col>

                  {/* Nút tăng/giảm số lượng */}
                  <Col md={3} className="text-center mb-2 mb-md-0">
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <Button
                        variant="light"
                        className="rounded-circle border shadow-sm d-flex justify-content-center align-items-center"
                        disabled={item.qty <= 1}
                        onClick={() => updateQty(item._id, item.qty - 1, item.color, item.storageLabel)}
                        style={{ width: '32px', height: '32px', padding: 0 }}
                      >
                        <FaMinus size={10} className="text-secondary" />
                      </Button>

                      <span className="fw-bold fs-5" style={{ minWidth: '30px', textAlign: 'center' }}>
                        {item.qty || 1}
                      </span>

                      <Button
                        variant="light"
                        className="rounded-circle border shadow-sm d-flex justify-content-center align-items-center"
                        onClick={() => handleIncreaseQty(item)}
                        style={{ width: '32px', height: '32px', padding: 0 }}
                      >
                        <FaPlus size={10} className="text-secondary" />
                      </Button>
                    </div>
                    {/* Hiển thị khi đang ở mức tối đa */}
                    {item.qty >= item.countInStock && (
                      <small className="text-warning fw-bold d-block mt-1">
                        Đã đạt giới hạn tồn kho
                      </small>
                    )}
                  </Col>
                  
                  {/* Nút xóa */}
                  <Col md={2} className="text-center text-md-end d-flex justify-content-center justify-content-md-end">
                    <Button 
                        variant="light" 
                        className="rounded-circle border shadow-sm d-flex align-items-center justify-content-center"
                        style={{ width: '38px', height: '38px' }}
                        onClick={() => removeFromCart(item._id, item.color, item.storageLabel)}
                        title="Xóa khỏi giỏ hàng"
                    >
                      <FaTrash className="text-danger" />
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
          </Card>
        )}
      </Col>

      <Col md={4}>
        <Card className="shadow-sm border-0 mt-3 mt-md-0 rounded-4 overflow-hidden">
          <Card.Header className="bg-light border-0 fw-bold py-3 px-4">
            <h5 className="mb-0 fw-bold">Tiến hành đặt hàng</h5>
          </Card.Header>
          <ListGroup variant="flush">
            <ListGroup.Item className="p-4 border-0">
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Tổng số lượng:</span>
                <span className="fw-bold">{totalQty} sản phẩm</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Thành tiền:</span>
                <span className="text-brand-red fw-bold fs-4">{totalPrice.toLocaleString('vi-VN')} đ</span>
              </div>
            </ListGroup.Item>
            <ListGroup.Item className="p-4 pt-0 border-0">
              <Button
                type="button"
                className="buy-btn w-100 py-3 fs-5 rounded-pill fw-bold shadow-sm"
                disabled={cartItems.length === 0}
                onClick={() => navigate(userInfo ? '/checkout' : '/login')}
              >
                Tiến hành Thanh toán
              </Button>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
  );
};

export default CartScreen;
