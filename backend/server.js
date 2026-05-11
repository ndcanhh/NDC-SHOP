// Gọi các công cụ (thư viện) mà chúng ta cần dùng
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Thiết lập cấu hình cơ bản
dotenv.config();
const connectDB = require('./config/db');
connectDB();
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const addressRoutes = require('./routes/addressRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const couponRoutes = require('./routes/couponRoutes');
const newsRoutes = require('./routes/newsRoutes');

const app = express();


// Chỉ cho phép Frontend (localhost:3000) gọi API, chặn domain lạ
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// Viết API Root
app.get('/', (req, res) => {
    res.send('Chào mừng bạn đến với Server của NDC Shop!');
});

app.use('/api/products', productRoutes);

app.use('/api/users', userRoutes);

app.use('/api/upload', uploadRoutes);

app.use('/api/orders', orderRoutes);

app.use('/api/contacts', contactRoutes);

app.use('/api/chatbot', chatbotRoutes);

app.use('/api/addresses', addressRoutes);

app.use('/api/payment', paymentRoutes);

app.use('/api/coupons', couponRoutes);

app.use('/api/news', newsRoutes);

// Middleware xử lý lỗi toàn cục
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server đang chạy thành công tại cửa số (Port) ${PORT}`);
});
