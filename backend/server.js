// Bước 1: Gọi các công cụ (thư viện) mà chúng ta cần dùng
const express = require('express'); // 1. Express: Khung xương để xây dựng Backend (như anh quản lý nhà hàng)
const cors = require('cors');       // 2. CORS: Cấp phép cho Frontend được "nói chuyện" với Backend này
const dotenv = require('dotenv');   // 3. Dotenv: Giúp đọc các mật khẩu ẩn trong file .env

// Bước 2: Thiết lập cấu hình cơ bản
dotenv.config(); // Kích hoạt việc đọc file .env (chúng ta sẽ tạo sau)
const connectDB = require('./config/db'); // Nhập hàm kết nối mở cửa Kho dữ liệu
connectDB(); // Gọi hàm đó để mở cửa Kho ngay khi Server bật lên
// Kéo các bảng chỉ đường phụ vào
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // Bảng chỉ đường Upload ảnh lên Cloudinary
const orderRoutes = require('./routes/orderRoutes');   // Bảng chỉ đường Đơn hàng
const contactRoutes = require('./routes/contactRoutes'); // Bảng chỉ đường Liên hệ
const chatbotRoutes = require('./routes/chatbotRoutes'); // Bảng chỉ đường Chatbot AI
const addressRoutes = require('./routes/addressRoutes'); // Bảng chỉ đường Sổ Địa Chỉ
const paymentRoutes = require('./routes/paymentRoutes'); // Bảng chỉ đường Thanh Toán
const couponRoutes = require('./routes/couponRoutes');   // Bảng chỉ đường Mã Giảm Giá
const newsRoutes = require('./routes/newsRoutes');       // Bảng chỉ đường Tin Tức

const app = express(); // Tạo ra máy chủ (server) của chúng ta

// Bước 3: Cho phép server hiểu được dữ liệu gửi lên
// Chỉ cho phép Frontend (localhost:3000) gọi API, chặn domain lạ
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json()); // Dạy cho server cách đọc API dạng JSON

// Bước 4: Viết "Biển báo" đầu tiên (API Root)
app.get('/', (req, res) => {
    res.send('Chào mừng bạn đến với Server của NDC Shop!');
});

// Treo bảng chỉ đường Sản phẩm lên cửa chính
// Bất cứ ai truy cập vào link có cụm từ '/api/products', sẽ được chuyển hướng thẳng vào file productRoutes xử lý
app.use('/api/products', productRoutes);

// Treo bảng chỉ đường Khách hàng lên cửa chính
app.use('/api/users', userRoutes);

// Treo bảng chỉ đường Upload ảnh lên Cloudinary
app.use('/api/upload', uploadRoutes);

// Treo bảng chỉ đường Đơn hàng
app.use('/api/orders', orderRoutes);

// Treo bảng chỉ đường Liên hệ
app.use('/api/contacts', contactRoutes);

// Treo bảng chỉ đường Chatbot AI
app.use('/api/chatbot', chatbotRoutes);

// Treo bảng chỉ đường Sổ Địa Chỉ
app.use('/api/addresses', addressRoutes);

// Treo bảng chỉ đường Thanh toán
app.use('/api/payment', paymentRoutes);

// Treo bảng chỉ đường Mã Giảm Giá
app.use('/api/coupons', couponRoutes);

// Treo bảng chỉ đường Tin Tức
app.use('/api/news', newsRoutes);

// Bước 5: Middleware xử lý lỗi toàn cục — bắt mọi lỗi throw ra từ controller/middleware
// Nếu không có cái này, lỗi sẽ hiện nguyên stack trace cho client → lộ thông tin hệ thống
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        // Chỉ hiện chi tiết lỗi khi đang phát triển, production thì ẩn đi
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Bước 6: Bật công tắc cho server hoạt động
// Server cần đứng đợi (listen) ở một Cửa (Port) cụ thể. Nếu không ai chỉ định (process.env.PORT) thì mở cửa 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    // Dòng này sẽ in ra Terminal / Console để chúng ta biết server đã chạy ngon lành chưa
    console.log(`Server đang chạy thành công tại cửa số (Port) ${PORT}`);
});
