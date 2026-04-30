import React, { useState, useEffect, useContext } from 'react';
import { CartContext } from './cartContextDef';
import { AuthContext } from './authContextValue';


// 2. Tạo một ông Thủ kho (Provider) để quản lý Kho này
export const CartProvider = ({ children }) => {
  const { userInfo } = useContext(AuthContext);
  const storageKey = userInfo ? `cartItems_${userInfo._id}` : 'cartItems_guest';

  // Lấy dữ liệu giỏ hàng cũ từ bộ nhớ tạm trình duyệt (localStorage) nếu có
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem(storageKey);
    return storedCart ? JSON.parse(storedCart) : [];
  });

  const [prevStorageKey, setPrevStorageKey] = useState(storageKey);

  // Điều chỉnh state ngay trong lúc render nếu tài khoản thay đổi (React Recommended)
  if (storageKey !== prevStorageKey) {
    const storedCart = localStorage.getItem(storageKey);
    setCartItems(storedCart ? JSON.parse(storedCart) : []);
    setPrevStorageKey(storageKey);
  }

  useEffect(() => {
    // Giỏ hàng thực sự thay đổi -> Lưu vào localStorage
    localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems, storageKey]);

  // Hàm tạo khóa duy nhất cho mỗi item trong giỏ (phân biệt theo biến thể)
  const getCartKey = (item) => `${item._id}_${item.color || ''}_${item.storageLabel || ''}`;

  // Hàm: Thêm 1 sản phẩm vào giỏ (có theo dõi số lượng qty)
  const addToCart = (product) => {
    const newKey = getCartKey(product);
    const existItem = cartItems.find((x) => getCartKey(x) === newKey);

    if (existItem) {
      // Nếu đã có cùng biến thể → tăng qty lên 1
      setCartItems(
        cartItems.map((x) =>
          getCartKey(x) === newKey
            ? { ...x, qty: x.qty + 1 }
            : x
        )
      );
    } else {
      // Nếu chưa có → thêm vào giỏ với qty = 1
      setCartItems([...cartItems, { ...product, qty: 1 }]);
    }
  };

  // Hàm: Cập nhật số lượng cho 1 sản phẩm
  const updateQty = (id, newQty, color = null, storageLabel = null) => {
    const targetKey = `${id}_${color || ''}_${storageLabel || ''}`;
    setCartItems(
      cartItems.map((x) =>
        getCartKey(x) === targetKey
          ? { ...x, qty: Math.max(1, newQty) }
          : x
      )
    );
  };

  // Hàm: Bỏ 1 sản phẩm khỏi giỏ
  const removeFromCart = (id, color = null, storageLabel = null) => {
    const targetKey = `${id}_${color || ''}_${storageLabel || ''}`;
    setCartItems(cartItems.filter((x) => getCartKey(x) !== targetKey));
  };

  // Hàm: Xóa toàn bộ giỏ hàng (dùng sau khi đặt hàng thành công)
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(storageKey);
  };

  return (
    // Giao chìa khóa Kho này cho toàn bộ ứng dụng (children)
    <CartContext.Provider value={{ cartItems, addToCart, updateQty, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
