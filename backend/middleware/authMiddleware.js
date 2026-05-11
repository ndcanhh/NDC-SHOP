const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

// Middleware bảo vệ
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Kiểm tra header có chứa Token dạng "Bearer xxxxxx" không
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Tách lấy phần Token (bỏ chữ "Bearer " phía trước)
            token = req.headers.authorization.split(' ')[1];

            // Giải mã Token để lấy ID người dùng
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Tìm user trong DB theo ID, bỏ trường password ra
            req.user = await User.findById(decoded.id).select('-password');

            next();
            return;
        } catch (error) {
            res.status(401);
            throw new Error('Token không hợp lệ, vui lòng đăng nhập lại!');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Bạn chưa đăng nhập! Vui lòng đăng nhập để tiếp tục.');
    }
});

// Middleware xác quyền Admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401);
        throw new Error('Từ chối truy cập. Bạn không có quyền Admin!');
    }
};

module.exports = { protect, admin };
