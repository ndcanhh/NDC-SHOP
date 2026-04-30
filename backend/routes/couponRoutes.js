const express = require('express');
const router = express.Router();
const { applyCoupon, getCoupons, createCoupon, deleteCoupon, updateCoupon } = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

// POST /api/coupons/apply — Người dùng áp mã (cần đăng nhập)
router.post('/apply', protect, applyCoupon);

// GET /api/coupons — Lấy danh sách mã (Admin)
// POST /api/coupons — Tạo mã mới (Admin)
router.route('/')
    .get(protect, admin, getCoupons)
    .post(protect, admin, createCoupon);

// DELETE /api/coupons/:id — Xóa mã (Admin)
// PUT /api/coupons/:id — Cập nhật mã (Admin)
router.route('/:id')
    .delete(protect, admin, deleteCoupon)
    .put(protect, admin, updateCoupon);

module.exports = router;
