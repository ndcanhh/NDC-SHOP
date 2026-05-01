# NDC SHOP - Backend ⚙️

Thư mục này chứa mã nguồn máy chủ (Backend API) của hệ thống NDC SHOP.

## 🚀 Công nghệ sử dụng
- **Node.js & Express**: Máy chủ API.
- **Mongoose**: Kết nối và quản lý dữ liệu MongoDB.
- **JWT (JSON Web Token)**: Xác thực người dùng và phân quyền Admin.
- **VNPay SDK**: Xử lý thanh toán.
- **Groq AI**: Xử lý logic Chatbot.
- **Cloudinary**: Lưu trữ ảnh tải lên từ Admin.

## 📦 Cài đặt & Chạy Local
1. Cài đặt dependencies: `npm install`
2. Chạy server: `npm start` hoặc `node server.js`

## 📁 Cấu trúc thư mục
- `/models`: Định nghĩa các bảng dữ liệu (Schemas).
- `/routes`: Các đường dẫn API.
- `/controllers`: Logic xử lý nghiệp vụ.
- `/middleware`: Kiểm tra quyền truy cập (Auth).
- `/config`: Cấu hình kết nối Database.

---
*Xem README.md tại thư mục gốc để biết thêm chi tiết về toàn bộ hệ thống.*
