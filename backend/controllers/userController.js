const asyncHandler = require('express-async-handler'); // Thư viện gom lỗi tự động, tránh phải viết try-catch nhiều lần
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    1. ĐĂNG NHẬP (Cấp thẻ cho khách)
// @route   POST /api/users/login
const authUser = asyncHandler(async (req, res) => {
    // Khách hàng gửi lên email và pass từ màn hình
    const { email, password } = req.body; 

    // Tìm trong Kho xem có khách nào dùng email này không?
    const user = await User.findOne({ email });

    // Nếu tìm thấy khách VÀ mật khẩu họ nhập TRÙNG KHỚP với mật khẩu đã băm
    if (user && (await user.matchPassword(password))) {
        // Gửi trả về thông tin cá nhân và 1 cái thẻ Token
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isAdmin: user.role === 'admin',
            token: generateToken(user._id) // Đây, In thẻ JWT và giao luôn!
        });
    } else {
        // Đăng nhập sai
        res.status(401);
        throw new Error('Email hoặc mật khẩu không chính xác!');
    }
});

// @desc    2. ĐĂNG KÝ (Tạo hồ sơ khách hàng mới)
// @route   POST /api/users
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Xem thử email này đã có ai xài chưa
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400); // 400 Bad Request
        throw new Error('Email này đã được sử dụng rồi!');
    }

    // Nếu chưa ai xài thì tạo khách hàng mới
    // (Lưu ý: Mật khẩu lúc này sẽ tự động bị băm ra nhờ cái đoạn code 'pre save' ở userModel.js)
    const user = await User.create({
        name,
        email,
        password
    });

    if (user) {
        // Tạo thành công, báo tin vui và cấp Thẻ (Token) ngay và luôn cho họ xài
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isAdmin: user.role === 'admin',
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Dữ liệu không hợp lệ!');
    }
});

// @desc    3. CẬP NHẬT THÔNG TIN CÁ NHÂN (Yêu cầu đăng nhập)
// @route   PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('Không tìm thấy người dùng!');
    }

    user.name = req.body.name || user.name;

    // Nếu muốn đổi email → kiểm tra xem email mới có ai xài chưa
    if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
            res.status(400);
            throw new Error('Email này đã được người khác sử dụng!');
        }
        user.email = req.body.email;
    }

    if (req.body.phone !== undefined) {
        user.phone = req.body.phone;
    }

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isAdmin: updatedUser.role === 'admin',
        token: generateToken(updatedUser._id),
    });
});

// @desc    4. ĐỔI MẬT KHẨU (Yêu cầu đăng nhập)
// @route   PUT /api/users/password
const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Tìm user theo ID (lấy từ middleware protect)
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('Không tìm thấy người dùng!');
    }

    // Kiểm tra mật khẩu cũ có đúng không
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        res.status(400);
        throw new Error('Mật khẩu hiện tại không chính xác!');
    }

    // Gán mật khẩu mới (pre-save hook sẽ tự động băm)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công!' });
});

// @desc    5. Lấy danh sách tất cả người dùng (Cho Admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

// @desc    6. Xóa người dùng (Cho Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // Bảo vệ không cho xóa các tài khoản Admin
        if (user.role === 'admin') {
            res.status(400);
            throw new Error('Không thể xóa tài khoản quản trị viên (Admin)!');
        }
        await User.deleteOne({ _id: user._id });
        res.json({ message: 'Tài khoản đã được xóa thành công!' });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy người dùng!');
    }
});

module.exports = { authUser, registerUser, updateProfile, updatePassword, getUsers, deleteUser };
