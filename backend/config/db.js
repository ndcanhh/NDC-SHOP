const mongoose = require('mongoose'); 

// Hàm kết nối CSDL
const connectDB = async () => {
    try {
        // Kết nối bằng địa chỉ trong .env
        const conn = await mongoose.connect(process.env.MONGO_URI);

        // Kết nối thành công
        console.log(`Kết nối Database thành công: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Lỗi kết nối Database: ${error.message}`);

        process.exit(1);
    }
};

module.exports = connectDB;
