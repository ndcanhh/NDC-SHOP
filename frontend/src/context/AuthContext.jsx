import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './authContextValue';

export const AuthProvider = ({ children }) => {
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

  const login = async (email, password) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      
      // Gọi về API Đăng Nhập của Backend (Lấy thư mục token)
      const { data } = await axios.post('/api/users/login', { email, password }, config);
      
      setUserInfo(data);
      return { success: true };
    } catch (error) {
      return { 
          success: false, 
          message: error.response && error.response.data.message ? error.response.data.message : error.message 
      };
    }
  };

  // Hàm xử lý Đăng Xuất
  const logout = () => {
    sessionStorage.removeItem('compare_p1');
    sessionStorage.removeItem('compare_p2');
    sessionStorage.removeItem('compare_s1');
    sessionStorage.removeItem('compare_s2');
    
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
