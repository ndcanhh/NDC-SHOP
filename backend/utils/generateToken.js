const jwt = require('jsonwebtoken');

// Hàm này như một "Cái máy in Thẻ"
// Nhiệm vụ: Nhận vào ID của người dùng, in cho họ 1 cái thẻ JWT có hiệu lực 30 ngày.
const generateToken = (id) => {
    // Tạo mã bằng phương thức jwt.sign()
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d' // Thẻ này 30 ngày sau sẽ hết hạn, bắt họ đăng nhập lại
    });
};

module.exports = generateToken;
