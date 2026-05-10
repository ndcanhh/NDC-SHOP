const mongoose = require('mongoose'); // Gọi thư viện Mongoose chuyên làm việc với MongoDB

// Hàm kết nối CSDL
const connectDB = async () => {
    try {
        // Cố gắng kết nối bằng địa chỉ được ghi trong file .env
        const conn = await mongoose.connect(process.env.MONGO_URI);

        // Nếu kết nối thành công, in ra để báo hiệu
        console.log(`Kết nối Database thành công: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Lỗi kết nối Database: ${error.message}`);

        process.exit(1);
    }
};

module.exports = connectDB;
