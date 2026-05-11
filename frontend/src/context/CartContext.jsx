import React, { useState, useEffect, useContext } from 'react';
import { CartContext } from './cartContextDef';
import { AuthContext } from './authContextValue';


export const CartProvider = ({ children }) => {
  const { userInfo } = useContext(AuthContext);
  const storageKey = userInfo ? `cartItems_${userInfo._id}` : 'cartItems_guest';

  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem(storageKey);
    return storedCart ? JSON.parse(storedCart) : [];
  });

  const [prevStorageKey, setPrevStorageKey] = useState(storageKey);

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

  const addToCart = (product, qty = 1) => {
    const newKey = getCartKey(product);
    const existItem = cartItems.find((x) => getCartKey(x) === newKey);

    if (existItem) {
      // Nếu đã có cùng biến thể → cộng thêm số lượng mới nhưng không vượt quá tồn kho
      const updatedQty = existItem.qty + qty;
      if (updatedQty > product.countInStock) {
        setCartItems(
          cartItems.map((x) =>
            getCartKey(x) === newKey
              ? { ...x, qty: product.countInStock }
              : x
          )
        );
        return false;
      }
      setCartItems(
        cartItems.map((x) =>
          getCartKey(x) === newKey
            ? { ...x, qty: updatedQty }
            : x
        )
      );
      return true;
    } else {
      if (product.countInStock > 0) {
        // Thêm mới với số lượng qty đã chọn
        const initialQty = Math.min(qty, product.countInStock);
        setCartItems([...cartItems, { ...product, qty: initialQty }]);
        return true;
      }
      return false;
    }
  };

  const updateQty = (id, newQty, color = null, storageLabel = null) => {
    const targetKey = `${id}_${color || ''}_${storageLabel || ''}`;
    setCartItems(
      cartItems.map((x) =>
        getCartKey(x) === targetKey
          ? { ...x, qty: Math.min(x.countInStock, Math.max(1, newQty)) }
          : x
      )
    );
  };

  const removeFromCart = (id, color = null, storageLabel = null) => {
    const targetKey = `${id}_${color || ''}_${storageLabel || ''}`;
    setCartItems(cartItems.filter((x) => getCartKey(x) !== targetKey));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(storageKey);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQty, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
