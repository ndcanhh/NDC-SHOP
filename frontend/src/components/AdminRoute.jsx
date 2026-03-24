import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/authContextValue';

const AdminRoute = () => {
  const { userInfo } = useContext(AuthContext);

  // Nếu người dùng đã đăng nhập VÀ có quyền Admin thì mới cho vào Outlet (Các route con)
  // Nếu không, đuổi về trang chủ hoặc trang đăng nhập
  return userInfo && userInfo.isAdmin ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default AdminRoute;
