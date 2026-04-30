const asyncHandler = require('express-async-handler');
const Coupon = require('../models/couponModel');

// ============================================================
// @desc    Áp dụng mã giảm giá (User gọi từ trang Checkout)
// @route   POST /api/coupons/apply
// @access  Private
// ============================================================
const applyCoupon = asyncHandler(async (req, res) => {
    const { code, orderTotal } = req.body;

    if (!code || !orderTotal) {
        res.status(400);
        throw new Error('Vui lòng cung cấp mã giảm giá và tổng tiền đơn hàng.');
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    // Kiểm tra 1: Mã có tồn tại không?
    if (!coupon) {
        res.status(404);
        throw new Error('Mã giảm giá không tồn tại.');
    }

    // Kiểm tra 2: Mã có đang hoạt động không?
    if (!coupon.isActive) {
        res.status(400);
        throw new Error('Mã giảm giá này đã bị vô hiệu hóa.');
    }

    // Kiểm tra 3: Mã có còn hạn sử dụng không?
    if (new Date() > coupon.expirationDate) {
        res.status(400);
        throw new Error('Mã giảm giá này đã hết hạn sử dụng.');
    }

    // Kiểm tra 4: Còn lượt sử dụng không?
    if (coupon.usedCount >= coupon.usageLimit) {
        res.status(400);
        throw new Error('Mã giảm giá này đã được dùng hết lượt.');
    }

    // Kiểm tra 5: Đơn hàng có đủ giá trị tối thiểu không?
    if (orderTotal < coupon.minOrderValue) {
        res.status(400);
        throw new Error(
            `Đơn hàng cần tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}đ để dùng mã này.`
        );
    }

    // Tính toán số tiền được giảm
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
        discountAmount = (orderTotal * coupon.discountValue) / 100;
    } else {
        discountAmount = coupon.discountValue;
    }

    // Không giảm quá tổng tiền đơn hàng
    discountAmount = Math.min(discountAmount, orderTotal);

    res.json({
        success: true,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount),
        finalTotal: Math.round(orderTotal - discountAmount),
    });
});

// ============================================================
// @desc    Lấy danh sách tất cả mã giảm giá (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
// ============================================================
const getCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
});

// ============================================================
// @desc    Tạo mã giảm giá mới (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
// ============================================================
const createCoupon = asyncHandler(async (req, res) => {
    const { code, discountType, discountValue, minOrderValue, usageLimit, expirationDate } = req.body;

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existingCoupon) {
        res.status(400);
        throw new Error('Mã giảm giá này đã tồn tại!');
    }

    const coupon = new Coupon({
        code,
        discountType,
        discountValue,
        minOrderValue: minOrderValue || 0,
        usageLimit: usageLimit || 100,
        expirationDate,
    });

    const created = await coupon.save();
    res.status(201).json(created);
});

// ============================================================
// @desc    Xóa mã giảm giá (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
// ============================================================
const deleteCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
        res.status(404);
        throw new Error('Không tìm thấy mã giảm giá.');
    }
    await coupon.deleteOne();
    res.json({ message: 'Đã xóa mã giảm giá thành công.' });
});

// ============================================================
// @desc    Cập nhật mã giảm giá (Admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
// ============================================================
const updateCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
        coupon.code = req.body.code || coupon.code;
        coupon.discountType = req.body.discountType || coupon.discountType;
        coupon.discountValue = req.body.discountValue || coupon.discountValue;
        coupon.minOrderValue = req.body.minOrderValue ?? coupon.minOrderValue;
        coupon.usageLimit = req.body.usageLimit ?? coupon.usageLimit;
        coupon.expirationDate = req.body.expirationDate || coupon.expirationDate;
        coupon.isActive = req.body.isActive ?? coupon.isActive;

        const updated = await coupon.save();
        res.json(updated);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy mã giảm giá.');
    }
});

module.exports = { applyCoupon, getCoupons, createCoupon, deleteCoupon, updateCoupon };
