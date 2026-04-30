import React, { useContext } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/cartContextDef';
import { FaCartPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Hàm "phép thuật" Cloudinary: chèn tham số resize + nén vào giữa URL
// VD: .../upload/v123/abc.png → .../upload/c_fill,w_400,h_400,q_auto,f_auto/v123/abc.png
// c_fill = cắt vừa khung | w_400,h_400 = 400x400px | q_auto = tự nén | f_auto = tự chọn định dạng nhẹ nhất (webp)
const optimizeCloudinaryUrl = (url, width = 400, height = 400) => {
    if (!url || !url.includes('cloudinary')) return url; // Nếu không phải URL Cloudinary thì bỏ qua
    return url.replace('/upload/', `/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`);
};

// Hàm tiện ích: Chọn màu sắc nổi bật cho các Tag phổ biến
const getBadgeVariant = (tag) => {
  const lowerTag = tag.toLowerCase();
  if (lowerTag.includes('hot')) return 'danger';
  if (lowerTag.includes('mới')) return 'success';
  if (lowerTag.includes('gaming')) return 'purple'; // Cần thêm class .bg-purple trong CSS nếu chưa có, tạm dùng 'dark' nếu không chắc
  if (lowerTag.includes('pin trâu')) return 'warning';
  if (lowerTag.includes('giá rẻ')) return 'info';
  return 'secondary';
};

const Product = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success('Đã thêm ' + product.name + ' vào giỏ hàng!');
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/checkout');
  };

  // Phần trăm giảm giá lấy từ DB (mặc định 20% nếu chưa có)
  const discount = product.discount ?? 20;

  // Giá gốc (chưa giảm) = giá bán hiện tại / (1 - discount%)
  // VD: giá bán 800k, giảm 20% → giá gốc = 800k / 0.8 = 1.000k
  const oldPrice = discount > 0 ? Math.round(product.price / (1 - discount / 100)) : product.price;

  return (
    <Card className='my-1 p-2 rounded shadow-sm h-100 product-card position-relative'>
      {discount > 0 && <div className="discount-badge">Giảm {discount}%</div>}

      <Link to={`/product/${product._id}`}>
        <Card.Img src={optimizeCloudinaryUrl(product.image)} variant='top' />
      </Link>

      <Card.Body className="d-flex flex-column p-0 pt-2">
        {/* Render Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mb-1 d-flex flex-wrap gap-1 px-2">
            {product.tags.map((tag, idx) => (
              <Badge 
                key={idx} 
                bg={getBadgeVariant(tag)}
                style={getBadgeVariant(tag) === 'purple' ? { backgroundColor: '#6f42c1' } : {}}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
          <Card.Title as='div' className='product-title'>
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

        <div className="price-box mb-2">
            {product.storageVariants && product.storageVariants.length > 0 ? (
              <>
                <span className="price-current">
                  Từ {Math.min(...product.storageVariants.map(v => v.price)).toLocaleString('vi-VN')} đ
                </span>
              </>
            ) : (
              <>
                <span className="price-current">{product.price.toLocaleString('vi-VN')} đ</span>
                {discount > 0 && <span className="price-old">{oldPrice.toLocaleString('vi-VN')} đ</span>}
              </>
            )}
        </div>

        <div className="d-flex gap-2 mt-auto">
          <Button 
            variant="danger" 
            className="buy-btn flex-grow-1 m-0" 
            onClick={handleBuyNow} 
            disabled={product.countInStock === 0}
          >
            {product.countInStock === 0 ? 'Hết hàng' : 'MUA NGAY'}
          </Button>
          <Button 
            variant="outline-danger" 
            className="flex-shrink-0" 
            style={{ width: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
            onClick={handleAddToCart} 
            disabled={product.countInStock === 0} 
            title="Thêm vào giỏ hàng"
          >
            <FaCartPlus size={18} />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Product;

