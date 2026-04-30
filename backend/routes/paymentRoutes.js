const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createVNPayPayment, verifyVNPayReturn } = require('../controllers/paymentController');

// Tạo URL thanh toán VNPay
router.post('/vnpay', protect, createVNPayPayment);

// Xác thực kết quả trả về từ VNPay (FE gọi sau khi nhận redirect)
router.post('/vnpay-verify', protect, verifyVNPayReturn);

module.exports = router;
