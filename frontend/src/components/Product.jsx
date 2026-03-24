import React, { useContext } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/cartContextDef';

// Hàm "phép thuật" Cloudinary: chèn tham số resize + nén vào giữa URL
// VD: .../upload/v123/abc.png → .../upload/c_fill,w_400,h_400,q_auto,f_auto/v123/abc.png
// c_fill = cắt vừa khung | w_400,h_400 = 400x400px | q_auto = tự nén | f_auto = tự chọn định dạng nhẹ nhất (webp)
const optimizeCloudinaryUrl = (url, width = 400, height = 400) => {
    if (!url || !url.includes('cloudinary')) return url; // Nếu không phải URL Cloudinary thì bỏ qua
    return url.replace('/upload/', `/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`);
};

const Product = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  const handleAddToCart = () => {
    addToCart(product);
    alert('Đã thêm ' + product.name + ' vào giỏ hàng!');
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
        <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
          <Card.Title as='div' className='product-title'>
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

        {/* Giá bán — sát ngay dưới tên, không có mt-auto */}
        <div className="price-box mb-2">
            <span className="price-current">{product.price.toLocaleString('vi-VN')} đ</span>
            <span className="price-old">{oldPrice.toLocaleString('vi-VN')} đ</span>
        </div>

        <Button variant="danger" className="buy-btn mt-auto" onClick={handleAddToCart} disabled={product.countInStock === 0}>
          {product.countInStock === 0 ? 'Hết hàng' : 'MUA NGAY'}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default Product;

