const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// POST /api/orders — Tạo đơn hàng (cần đăng nhập)
// GET /api/orders — Xem tất cả đơn hàng (chỉ Admin)
router.route('/')
    .post(protect, createOrder)
    .get(protect, admin, getOrders);

// GET /api/orders/myorders — Xem đơn hàng của tôi (cần đăng nhập)
router.get('/myorders', protect, getMyOrders);

// PUT /api/orders/:id/status — Cập nhật trạng thái đơn hàng (chỉ Admin)
router.route('/:id/status')
    .put(protect, admin, updateOrderStatus);

module.exports = router;
