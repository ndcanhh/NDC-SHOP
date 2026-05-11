import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Card, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { CartContext } from '../context/cartContextDef';
import { FaCartPlus, FaMinus, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProductScreen = () => {
  const { id: productId } = useParams();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${productId}`);
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
            const firstAvailable = data.variants.find(v => v.countInStock > 0) || data.variants[0];
            setSelectedVariant(firstAvailable);
            setSelectedColor(firstAvailable.color);
        }
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const uniqueColors = product.variants 
    ? [...new Map(product.variants.map(v => [v.color, v])).values()]
    : [];

  const availableStorages = product.variants
    ? product.variants.filter(v => v.color === selectedColor)
    : [];

  const handleAddToCart = () => {
    if (!selectedVariant) {
        toast.error('Vui lòng chọn phiên bản!');
        return;
    }
    addToCart({ 
        ...product, 
        price: selectedVariant.price,
        countInStock: selectedVariant.countInStock,
        color: selectedVariant.color,
        storageLabel: `${selectedVariant.ram} / ${selectedVariant.rom}`,
        image: selectedVariant.image
    }, qty);
    toast.success(`Đã thêm ${qty} sản phẩm vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  // Logic hiển thị trạng thái tồn kho
  const getStockStatus = () => {
    if (!selectedVariant || selectedVariant.countInStock <= 0) {
        return <span className="text-danger fw-bold">Hết hàng</span>;
    }
    if (selectedVariant.countInStock < 5) {
        return <span className="text-danger fw-bold">Chỉ còn {selectedVariant.countInStock} máy</span>;
    }
    return <span className="text-success fw-bold">Còn hàng</span>;
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="danger" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="product-screen-custom py-4" style={{ backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <style>{`
        .color-circle-option {
            transition: all 0.2s ease-in-out;
        }
        .color-circle-option:hover {
            transform: scale(1.15);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            z-index: 10;
        }
        .btn-version:hover:not(:disabled) {
            border-color: #d70018 !important;
            color: #d70018 !important;
        }
      `}</style>

      <div className="container">
        <Link className="btn btn-white shadow-sm rounded-pill px-4 mb-4 fw-medium border" to="/">
          Quay lại trang chủ
        </Link>

        <Row className="g-4">
          <Col lg={4} md={5}>
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100 d-flex align-items-center justify-content-center p-3">
              <Image 
                src={selectedVariant?.image || product.image} 
                alt={product.name} 
                fluid 
                style={{ maxHeight: '450px', objectFit: 'contain' }}
              />
            </Card>
          </Col>

          <Col lg={5} md={7}>
            <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden h-100">
              <ListGroup variant="flush">
                <ListGroup.Item className="p-4 border-bottom-0">
                  <h2 className="fw-bold text-dark mb-0" style={{ fontSize: '1.8rem' }}>{product.name}</h2>
                </ListGroup.Item>

                <ListGroup.Item className="px-4 py-3 border-top">
                  <div className="fw-bold mb-2">Màu sắc:</div>
                  <div className="d-flex gap-3 mb-2">
                    {uniqueColors.map((cv) => (
                      <div 
                        key={cv.color}
                        className={`p-1 rounded-circle border-2 cursor-pointer color-circle-option ${selectedColor === cv.color ? 'border-primary' : 'border-light'}`}
                        style={{ width: '40px', height: '40px', backgroundColor: 'white' }}
                        onClick={() => {
                            setSelectedColor(cv.color);
                            const firstForColor = product.variants.find(v => v.color === cv.color);
                            setSelectedVariant(firstForColor);
                        }}
                      >
                        <div className="w-100 h-100 rounded-circle" style={{ backgroundColor: cv.colorCode }} />
                      </div>
                    ))}
                  </div>
                  <div className="small text-muted">Đã chọn: <span className="fw-bold text-dark">{selectedColor}</span></div>
                </ListGroup.Item>

                <ListGroup.Item className="px-4 py-3">
                  <div className="fw-bold mb-2">Phiên bản:</div>
                  <Row className="g-2">
                    {availableStorages.map((sv, idx) => (
                      <Col xs={6} key={idx}>
                        <Button
                          variant="none"
                          className={`btn-version w-100 text-start p-2 rounded-3 border-2 transition-all ${selectedVariant?._id === sv._id ? 'border-danger bg-danger text-white' : 'border-light bg-light text-dark'}`}
                          onClick={() => setSelectedVariant(sv)}
                          disabled={sv.countInStock <= 0}
                          style={{ fontSize: '0.85rem' }}
                        >
                          <div className="fw-bold">{sv.rom}</div>
                          <div className={selectedVariant?._id === sv._id ? "text-white" : "text-danger"}>
                            {sv.price.toLocaleString('vi-VN')} đ
                          </div>
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item className="px-4 py-3">
                  <div className="fw-bold mb-2">Đặc điểm nổi bật:</div>
                  <div className="small text-muted lh-sm">
                    {product.description?.split('\n').slice(0, 3).join('. ')}...
                  </div>
                </ListGroup.Item>

                <ListGroup.Item className="px-4 py-3 bg-light-subtle">
                  <div className="fw-bold mb-2">Cấu hình chi tiết:</div>
                  <ul className="small text-muted ps-3 mb-0">
                    <li>RAM: {selectedVariant?.ram || product.specs?.ram}</li>
                    <li>ROM: {selectedVariant?.rom || product.specs?.rom}</li>
                    <li>Chip xử lý: {product.specs?.chip}</li>
                    <li>Dung lượng pin: {product.specs?.battery}</li>
                  </ul>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>

          <Col lg={3} md={12}>
            <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
              <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                <h5 className="fw-bold mb-0">Thông tin giao dịch</h5>
              </Card.Header>
              <ListGroup variant="flush" className="p-2">
                <ListGroup.Item className="border-0 d-flex justify-content-between align-items-center px-3 py-2">
                  <span className="text-muted">Giá:</span>
                  <span className="text-danger fw-bold fs-5">
                    {/* GIÁ TỰ ĐỘNG THAY ĐỔI THEO SỐ LƯỢNG */}
                    {( (selectedVariant?.price || 0) * qty ).toLocaleString('vi-VN')} đ
                  </span>
                </ListGroup.Item>
                
                <ListGroup.Item className="border-0 d-flex justify-content-between align-items-center px-3 py-2">
                  <span className="text-muted">Trạng thái:</span>
                  {getStockStatus()}
                </ListGroup.Item>

                <ListGroup.Item className="border-0 px-3 py-3 border-top border-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Số lượng:</span>
                    <div className="d-flex align-items-center gap-2">
                      <Button 
                        variant="light" 
                        size="sm" 
                        className="rounded-circle border"
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        disabled={qty <= 1}
                      >
                        <FaMinus size={10} />
                      </Button>
                      <span className="fw-bold px-2">{qty}</span>
                      <Button 
                        variant="light" 
                        size="sm" 
                        className="rounded-circle border"
                        onClick={() => setQty(Math.min(selectedVariant?.countInStock || 1, qty + 1))}
                        disabled={qty >= (selectedVariant?.countInStock || 1)}
                      >
                        <FaPlus size={10} />
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>

                <ListGroup.Item className="border-0 px-3 py-3">
                  <Button 
                    variant="danger" 
                    className="w-100 py-3 rounded-pill fw-bold mb-3 shadow-sm border-0"
                    style={{ backgroundColor: '#d70018' }}
                    disabled={!selectedVariant || selectedVariant.countInStock <= 0}
                    onClick={handleBuyNow}
                  >
                    MUA NGAY
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    className="w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 border-2"
                    disabled={!selectedVariant || selectedVariant.countInStock <= 0}
                    onClick={handleAddToCart}
                  >
                    <FaCartPlus /> Thêm vào giỏ hàng
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProductScreen;
