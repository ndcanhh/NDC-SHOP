const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    ĐĂNG NHẬP
// @route   POST /api/users/login
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isAdmin: user.role === 'admin',
            token: generateToken(user._id)
        });
    } else {
        res.status(401);
        throw new Error('Email hoặc mật khẩu không chính xác!');
    }
});

// @desc    ĐĂNG KÝ
// @route   POST /api/users
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('Email này đã được sử dụng rồi!');
    }

    const user = await User.create({
        name,
        email,
        password
    });

    if (user) {
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

// @desc    CẬP NHẬT THÔNG TIN CÁ NHÂN
// @route   PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('Không tìm thấy người dùng!');
    }

    user.name = req.body.name || user.name;

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

// @desc    ĐỔI MẬT KHẨU
// @route   PUT /api/users/password
const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('Không tìm thấy người dùng!');
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        res.status(400);
        throw new Error('Mật khẩu hiện tại không chính xác!');
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công!' });
});

// @desc    Lấy danh sách tất cả người dùng
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

// @desc    Xóa người dùng
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
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
