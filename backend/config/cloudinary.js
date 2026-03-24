// File này là "Sổ danh bạ" kết nối tới Cloudinary
// Giống như bạn lưu số điện thoại + mật khẩu WiFi của kho ảnh trên mây

const cloudinary = require('cloudinary').v2;

// Cấu hình kết nối: dùng 3 thông tin bí mật trong file .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Tên "kho" của bạn trên Cloudinary
    api_key: process.env.CLOUDINARY_API_KEY,       // "Số thẻ" để xác minh danh tính
    api_secret: process.env.CLOUDINARY_API_SECRET  // "Mật khẩu" bí mật
});

module.exports = cloudinary;
