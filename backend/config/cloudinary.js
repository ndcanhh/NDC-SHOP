// File này là nơi kết nối tới Cloudinary

const cloudinary = require('cloudinary').v2;

// Cấu hình kết nối: dùng 3 thông tin bí mật trong file .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
