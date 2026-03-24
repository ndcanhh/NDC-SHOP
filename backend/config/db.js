const mongoose = require('mongoose'); // Gọi thư viện Mongoose chuyên làm việc với MongoDB

// Hàm kết nối CSDL (Giống như hành động vặn chìa khóa mở cửa kho)
const connectDB = async () => {
    try {
        // Cố gắng kết nối bằng địa chỉ được ghi trong file .env
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        // Nếu kết nối thành công, in ra màu xanh để báo hiệu
        console.log(`Kết nối Database thành công: ${conn.connection.host}`);
    } catch (error) {
        // Nếu có lỗi (có thể do sai mật khẩu, chưa bật MongoDB), in ra lỗi màu đỏ
        console.error(`Lỗi kết nối Database: ${error.message}`);
        
        // Dừng toàn bộ chương trình (Nhà kho sập thì dẹp tiệm luôn, không chạy server nữa)
        process.exit(1);
    }
};

module.exports = connectDB; // Xuất hàm này ra để file server.js có thể gọi được
