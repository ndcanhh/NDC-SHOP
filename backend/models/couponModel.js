const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true, // Tự động chuyển thành chữ hoa, tránh nhập sai hoa thường
        trim: true,
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'], // percentage = giảm %, fixed = giảm tiền mặt
        required: true,
        default: 'percentage',
    },
    discountValue: {
        type: Number,
        required: true, // VD: 10 (nếu là %), hoặc 50000 (nếu là tiền mặt)
    },
    minOrderValue: {
        type: Number,
        default: 0, // Đơn tối thiểu bao nhiêu tiền mới được dùng
    },
    usageLimit: {
        type: Number,
        default: 100, // Tối đa bao nhiêu lượt dùng
    },
    usedCount: {
        type: Number,
        default: 0, // Đã được dùng bao nhiêu lần rồi
    },
    expirationDate: {
        type: Date,
        required: true, // Ngày hết hạn
    },
    isActive: {
        type: Boolean,
        default: true, // Admin có thể tắt mã mà không cần xóa
    },
}, {
    timestamps: true,
});

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
