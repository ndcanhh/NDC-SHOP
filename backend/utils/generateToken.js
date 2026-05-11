const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    // Tạo mã bằng phương thức jwt.sign()
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d' // 30 ngày sau sẽ hết hạn, bắt đăng nhập lại
    });
};

module.exports = generateToken;
