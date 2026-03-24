import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './authContextValue';

export const AuthProvider = ({ children }) => {
  // 2. Lấy hồ sơ cũ từ Chrome (Trình duyệt) nếu họ đã từng đăng nhập
  const storedUser = localStorage.getItem('userInfo');
  const userInfoFromStorage = storedUser ? JSON.parse(storedUser) : null;

  const [userInfo, setUserInfo] = useState(userInfoFromStorage);

  // Lưu thông tin người dùng vào trình duyệt mỗi khi họ đăng nhập xong
  useEffect(() => {
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } else {
      localStorage.removeItem('userInfo');
    }
  }, [userInfo]);

  // Hàm xử lý Đăng Nhập (Nói chuyện với anh Shipper Axios gọi về Backend)
  const login = async (email, password) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      
      // Gọi về API Đăng Nhập của Backend (Lấy thư mục token)
      const { data } = await axios.post('/api/users/login', { email, password }, config);
      
      // Thành công -> Bỏ thông tin người dùng có chứa Thẻ thông hành vào kho
      setUserInfo(data);
      return { success: true };
    } catch (error) {
      return { 
          success: false, 
          message: error.response && error.response.data.message ? error.response.data.message : error.message 
      };
    }
  };

  // Hàm xử lý Đăng Xuất (Xóa hồ sơ khỏi trình duyệt và gỡ Thẻ)
  const logout = () => {
    setUserInfo(null);
  };

  // Hàm xử lý Đăng Ký
  const register = async (name, email, password) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/users', { name, email, password }, config);
      
      // Đăng ký xong thì coi như Đăng nhập luôn
      setUserInfo(data);
      return { success: true };
    } catch (error) {
       return { 
          success: false, 
          message: error.response && error.response.data.message ? error.response.data.message : error.message 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ userInfo, setUserInfo, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
