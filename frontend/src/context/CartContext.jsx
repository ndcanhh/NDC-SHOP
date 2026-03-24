import React, { useState, useEffect } from 'react';
import { CartContext } from './cartContextDef';


// 2. Tạo một ông Thủ kho (Provider) để quản lý Kho này
export const CartProvider = ({ children }) => {
  // Lấy dữ liệu giỏ hàng cũ từ bộ nhớ tạm trình duyệt (localStorage) nếu có
  const storedCart = localStorage.getItem('cartItems');
  const cartFromStorage = storedCart ? JSON.parse(storedCart) : [];

  const [cartItems, setCartItems] = useState(cartFromStorage);

  // Hàm: Thêm 1 sản phẩm vào giỏ (có theo dõi số lượng qty)
  const addToCart = (product) => {
    const existItem = cartItems.find((x) => x._id === product._id);

    if (existItem) {
      // Nếu đã có → tăng qty lên 1, nhưng không được vượt quá tồn kho
      setCartItems(
        cartItems.map((x) =>
          x._id === existItem._id
            ? { ...x, qty: Math.min(x.qty + 1, x.countInStock) }
            : x
        )
      );
    } else {
      // Nếu chưa có → thêm vào giỏ với qty = 1
      setCartItems([...cartItems, { ...product, qty: 1 }]);
    }
  };

  // Hàm: Cập nhật số lượng cho 1 sản phẩm (clamp giữa 1 và countInStock)
  const updateQty = (id, newQty) => {
    setCartItems(
      cartItems.map((x) =>
        x._id === id
          ? { ...x, qty: Math.max(1, Math.min(newQty, x.countInStock)) }
          : x
      )
    );
  };

  // Hàm: Bỏ 1 sản phẩm khỏi giỏ
  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((x) => x._id !== id));
  };

  // Hàm: Xóa toàn bộ giỏ hàng (dùng sau khi đặt hàng thành công)
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  // 3. Mỗi khi Giỏ hàng (cartItems) thay đổi, tự động lưu lại vào trình duyệt
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    // Giao chìa khóa Kho này cho toàn bộ ứng dụng (children)
    <CartContext.Provider value={{ cartItems, addToCart, updateQty, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
