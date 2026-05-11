import React, { useContext } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/cartContextDef';
import { AuthContext } from '../context/authContextValue';
import { FaCartPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { optimizeCloudinaryUrl } from '../utils/imageUtils';

// Hàm tiện ích: Chọn màu sắc nổi bật cho các Tag phổ biến
const getBadgeVariant = (tag) => {
  const lowerTag = tag.toLowerCase();
  if (lowerTag.includes('hot')) return 'danger';
  if (lowerTag.includes('mới')) return 'success';
  if (lowerTag.includes('gaming')) return 'dark';
  if (lowerTag.includes('pin trâu')) return 'warning';
  if (lowerTag.includes('giá rẻ')) return 'info';
  return 'secondary';
};

const Product = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const defaultColor = product.colorVariants && product.colorVariants.length > 0 ? product.colorVariants[0] : null;
  const defaultStorage = product.storageVariants && product.storageVariants.length > 0 ? 
    product.storageVariants.reduce((min, v) => v.price < min.price ? v : min, product.storageVariants[0]) : null;

  const displayStock = defaultStorage ? defaultStorage.countInStock : 0;

  const handleAddToCart = () => {
    if (!userInfo) {
      toast.warning('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      navigate('/login');
      return;
    }

    const cartItem = {
      ...product,
      price: defaultStorage ? defaultStorage.price : product.price,
      countInStock: defaultStorage ? defaultStorage.countInStock : 0,
      image: defaultColor ? defaultColor.image : product.image,
      color: defaultColor ? defaultColor.color : null,
      storageLabel: defaultStorage ? defaultStorage.label : null,
    };

    const success = addToCart(cartItem);
    if (success) {
      toast.success('Đã thêm ' + product.name + ' vào giỏ hàng!');
    } else {
      toast.error('Số lượng trong giỏ hàng đã đạt giới hạn tồn kho!');
    }
  };

  const handleBuyNow = () => {
    if (!userInfo) {
      toast.warning('Vui lòng đăng nhập để mua hàng!');
      navigate('/login');
      return;
    }

    const cartItem = {
      ...product,
      price: defaultStorage ? defaultStorage.price : product.price,
      countInStock: defaultStorage ? defaultStorage.countInStock : 0,
      image: defaultColor ? defaultColor.image : product.image,
      color: defaultColor ? defaultColor.color : null,
      storageLabel: defaultStorage ? defaultStorage.label : null,
    };

    const success = addToCart(cartItem);
    if (!success) {
      toast.error('Số lượng trong giỏ hàng đã đạt giới hạn tồn kho!');
    }
    navigate('/checkout');
  };

  // Phần trăm giảm giá lấy từ DB
  const discount = product.discount || 0;

  // Giá gốc = giá bán hiện tại / (1 - discount%)
  const oldPrice = discount > 0 ? Math.round(product.price / (1 - discount / 100)) : product.price;

  return (
    <Card className='my-1 p-3 border-0 rounded-4 shadow-sm h-100 product-card position-relative bg-white'>
      {discount > 0 && <div className="discount-badge">Giảm {discount}%</div>}

      <Link to={`/product/${product._id}`}>
        <Card.Img 
          src={optimizeCloudinaryUrl(product.image, 320, 320)} 
          variant='top' 
          loading="lazy"
          style={{ aspectRatio: '1/1', objectFit: 'contain' }}
        />
      </Link>

      <Card.Body className="d-flex flex-column p-0 pt-2">
        {/* Render Tags (Luôn giữ khung để căn lề) */}
        <div className="product-tags">
          {product.tags && product.tags.length > 0 && (
            product.tags.map((tag, idx) => (
              <Badge 
                key={idx} 
                bg={getBadgeVariant(tag)}
                className="rounded-pill px-3 py-1 shadow-sm"
                style={getBadgeVariant(tag) === 'purple' ? { backgroundColor: '#6f42c1' } : {}}
              >
                {tag}
              </Badge>
            ))
          )}
        </div>

        <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
          <Card.Title as='div' className='product-title'>
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

        <div className="price-box mb-2">
            {product.storageVariants && product.storageVariants.length > 0 ? (
              <>
                <span className="price-current">
                  {Math.min(...product.storageVariants.map(v => v.price)).toLocaleString('vi-VN')} đ
                </span>
              </>
            ) : (
              <>
                <span className="price-current">{product.price.toLocaleString('vi-VN')} đ</span>
                {discount > 0 && <span className="price-old">{oldPrice.toLocaleString('vi-VN')} đ</span>}
              </>
            )}
        </div>

        <div className="d-flex gap-2 mt-auto align-items-center">
          {displayStock === 0 ? (
            <Button variant="secondary" className="flex-grow-1 m-0 rounded-pill fw-bold shadow-sm" disabled>
              Hết hàng
            </Button>
          ) : (
            <>
              <Button 
                variant="danger" 
                className="buy-btn flex-grow-1 m-0 rounded-pill fw-bold shadow-sm" 
                onClick={handleBuyNow} 
              >
                MUA NGAY
              </Button>
              <Button 
                variant="light" 
                className="flex-shrink-0 rounded-circle shadow-sm border d-flex align-items-center justify-content-center text-danger" 
                style={{ width: '42px', height: '42px', padding: 0 }}
                onClick={handleAddToCart} 
                title="Thêm vào giỏ hàng"
              >
                <FaCartPlus size={18} />
              </Button>
            </>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default Product;

