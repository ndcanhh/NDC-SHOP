import { createContext } from 'react';

// Tạo Kho chứa Thông tin Đăng Nhập (Hồ sơ người dùng)
// Tách riêng ra file này để Fast Refresh hoạt động đúng
export const AuthContext = createContext();
