import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { CartContext } from '../context/cartContextDef';
import { AuthContext } from '../context/authContextValue';

const CartScreen = () => {
  // Lấy danh sách sản phẩm và các hàm xử lý từ Context
  const { cartItems, updateQty, removeFromCart } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  // Tổng số lượng sản phẩm (cộng tất cả qty)
  const totalQty = cartItems.reduce((acc, item) => acc + (item.qty || 1), 0);

  // Tổng tiền = giá × số lượng từng món
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * (item.qty || 1), 0);

  return (
    <Row>
      <Col md={8}>
        <h2 className="mb-4 text-brand-red fw-bold">Giỏ hàng của bạn</h2>
        
        {/* Kiểm tra giỏ hàng có trống không */}
        {cartItems.length === 0 ? (
          <div className="alert alert-info border-0 shadow-sm" style={{ backgroundColor: '#e9ecef', color: '#555' }}>
            Giỏ hàng của bạn đang trống! <Link to="/" className="fw-bold text-brand-red">Đi mua sắm ngay</Link>
          </div>
        ) : (
          <ListGroup variant="flush" className="shadow-sm rounded border">
            {cartItems.map((item, index) => (
              <ListGroup.Item key={`${item._id}_${item.color || ''}_${item.storageLabel || ''}_${index}`} className="p-3">
                <Row className="align-items-center">
                  {/* Ảnh sản phẩm */}
                  <Col md={2}>
                    <Image src={item.image} alt={item.name} fluid rounded />
                  </Col>
                  
                  {/* Tên sản phẩm + biến thể */}
                  <Col md={3}>
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
                  <Col md={2} className="text-brand-red fw-bold text-center">
                    {item.price.toLocaleString('vi-VN')} đ
                  </Col>

                  {/* Nút tăng/giảm số lượng */}
                  <Col md={3} className="text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={item.qty <= 1}
                        onClick={() => updateQty(item._id, item.qty - 1, item.color, item.storageLabel)}
                        style={{ width: '32px', height: '32px', padding: 0 }}
                      >
                        <FaMinus size={10} />
                      </Button>

                      <span className="fw-bold fs-5" style={{ minWidth: '30px', textAlign: 'center' }}>
                        {item.qty || 1}
                      </span>

                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={item.qty >= item.countInStock}
                        onClick={() => updateQty(item._id, item.qty + 1, item.color, item.storageLabel)}
                        style={{ width: '32px', height: '32px', padding: 0 }}
                      >
                        <FaPlus size={10} />
                      </Button>
                    </div>
                    {/* Hiển thị số lượng tồn kho */}
                    <small className="text-muted">Kho: {item.countInStock}</small>
                  </Col>
                  
                  {/* Nút xóa */}
                  <Col md={2} className="text-end">
                    <Button 
                        variant="light" 
                        className="text-danger" 
                        onClick={() => removeFromCart(item._id, item.color, item.storageLabel)}
                    >
                      <FaTrash />
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Col>

      <Col md={4}>
        <Card className="shadow-sm border-0 mt-3 mt-md-0">
          <ListGroup variant="flush">
            <ListGroup.Item className="bg-light">
              <h4 className="mb-0 fw-bold">Tiến hành đặt hàng</h4>
            </ListGroup.Item>
            <ListGroup.Item>
              <div className="d-flex justify-content-between my-2">
                <span>Tổng số lượng:</span>
                <span className="fw-bold">{totalQty} món</span>
              </div>
              <div className="d-flex justify-content-between my-2">
                <span>Thành tiền:</span>
                <span className="text-brand-red fw-bold fs-4">{totalPrice.toLocaleString('vi-VN')} đ</span>
              </div>
            </ListGroup.Item>
            <ListGroup.Item>
              <Button
                type="button"
                className="buy-btn w-100 py-2 fs-5"
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
