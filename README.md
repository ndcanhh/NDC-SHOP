# NDC SHOP - Hệ Thống Thương Mại Điện Tử Thiết Bị Di Động 🚀

**NDC SHOP** là dự án khóa luận tốt nghiệp, được xây dựng với mục tiêu cung cấp một nền tảng mua sắm trực tuyến hiện đại, mượt mà và đầy đủ tính năng cho các sản phẩm công nghệ (iPhone, Samsung, Xiaomi,...).

## 🌐 Demo Trực Tuyến
- **Frontend**: [ndc-shop-theta.vercel.app](https://ndc-shop-theta.vercel.app/)
- **Backend API**: [ndc-shop-api.onrender.com](https://ndc-shop-api.onrender.com/)

---

## ✨ Tính Năng Nổi Bật

### 🛒 Dành cho Khách hàng
- **Mua sắm thông minh**: Duyệt sản phẩm theo danh mục, hãng sản xuất và tag (Hot, Mới, Gaming...).
- **Tìm kiếm nâng cao**: Tìm kiếm sản phẩm theo tên với tốc độ nhanh.
- **Biến thể sản phẩm**: Hỗ trợ chọn màu sắc và dung lượng (RAM/ROM) với giá thay đổi tương ứng.
- **So sánh sản phẩm**: Công cụ so sánh thông số kỹ thuật giữa các thiết bị trực quan.
- **Giỏ hàng & Thanh toán**: Hệ thống giỏ hàng mạnh mẽ, tích hợp thanh toán trực tuyến qua **VNPay** và COD.
- **Mã giảm giá (Coupon)**: Áp dụng các mã khuyến mãi trực tiếp khi đặt hàng.
- **Trợ lý ảo AI**: Chatbot tích hợp **Groq AI** hỗ trợ tư vấn sản phẩm 24/7.
- **Tin tức công nghệ**: Cập nhật các bài viết đánh giá, tin tức mới nhất.

### 🛡️ Dành cho Quản trị viên (Admin)
- **Bảng điều khiển (Dashboard)**: Thống kê doanh thu, đơn hàng và biểu đồ tăng trưởng bằng Chart.js.
- **Quản lý Sản phẩm**: Thêm, sửa, ẩn/hiện sản phẩm và biến thể.
- **Quản lý Đơn hàng**: Theo dõi trạng thái, xác nhận hoặc hủy đơn.
- **Quản lý Tin tức**: Hệ thống CMS soạn thảo và đăng bài viết.
- **Quản lý Liên hệ**: Tiếp nhận và phản hồi tin nhắn từ khách hàng.

---

## 🛠️ Công Nghệ Sử Dụng

### Core Stack (MERN)
- **MongoDB**: Cơ sở dữ liệu NoSQL (Atlas Cloud).
- **Express.js**: Framework backend mạnh mẽ.
- **React.js**: Thư viện UI hiện đại (Vite).
- **Node.js**: Môi trường chạy server.

### Dịch vụ & Thư viện bổ trợ
- **Cloudinary**: Quản lý và tối ưu hóa hình ảnh đám mây.
- **VNPay SDK**: Cổng thanh toán điện tử hàng đầu Việt Nam.
- **Groq SDK**: Tích hợp mô hình ngôn ngữ lớn (LLM) cho Chatbot.
- **React Bootstrap**: Giao diện Responsive, chuyên nghiệp.
- **Axios & Context API**: Quản lý trạng thái và gọi API.

---

## 🚀 Hướng Dẫn Cài Đặt (Local)

### 1. Yêu cầu hệ thống
- Node.js (v16 trở lên)
- MongoDB (Local hoặc Atlas)

### 2. Cấu hình biến môi trường (.env)
Tạo file `.env` trong thư mục `backend/` với các tham số:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GROQ_API_KEY=...
VNP_TMN_CODE=...
VNP_HASH_SECRET=...
```

### 3. Chạy dự án
**Chạy Backend:**
```bash
cd backend
npm install
npm start
```

**Chạy Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 👨‍💻 Tác Giả
- **Họ tên**: Nguyễn Đức Cảnh
- **Đề tài**: Xây dựng website thương mại điện tử NDC SHOP.
- **Đơn vị**: Đại học Kinh tế Quốc dân

---
*Dự án được xây dựng với sự tâm huyết cho kỳ thực tập và khóa luận tốt nghiệp 2026.*
