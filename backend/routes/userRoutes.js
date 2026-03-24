const express = require('express');
const router = express.Router();
const { authUser, registerUser, updateProfile, updatePassword, getUsers, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Route gốc: POST thì tạo khách mới, GET thì lấy danh sách (chỉ Admin)
router.route('/')
    .post(registerUser)
    .get(protect, admin, getUsers);

// Khách muốn đăng nhập
router.post('/login', authUser);

// Cập nhật thông tin cá nhân (cần đăng nhập)
router.put('/profile', protect, updateProfile);

// Đổi mật khẩu (cần đăng nhập)
router.put('/password', protect, updatePassword);

// Các thao tác cần truyền ID lên đường dẫn (Chỉ Admin)
router.route('/:id')
    .delete(protect, admin, deleteUser);

module.exports = router;
