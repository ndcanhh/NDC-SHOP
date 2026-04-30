const mongoose = require('mongoose');

// Quyển sổ dùng để lưu lại các Đơn Hàng mà người dùng đã bấm Thanh Toán
const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, // Cú pháp này giống như dùng Sợi Dây liên kết với ID của User
        required: true,
        ref: 'User' // Chỉ rõ sợi dây này nối sang quyển sổ 'User'
    },
    orderItems: [ // Dùng mảng (Array) [ ] vì khách có thể mua rất nhiều loại điện thoại trong 1 đơn
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true }, // Số lượng họ mua (VD: 2 cái Iphone 15)
            image: { type: String, required: true },
            price: { type: Number, required: true }, // Giá lúc đó (Vì lỡ sau này có giảm giá thì đơn cũ vẫn giữ giá cũ)
            color: { type: String },         // Biến thể màu sắc đã chọn (VD: "Đen Titan")
            storageLabel: { type: String },  // Biến thể ROM đã chọn (VD: "8GB/256GB")
            product: { // Liên kết về quyển sổ 'Product' để biết cái điện thoại nào
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            }
        }
    ],
    shippingAddress: { // Điểm đến
        address: { type: String, required: true },
        city: { type: String, required: true },
        phone: { type: String, required: true }
    },
    totalPrice: { // Tổng số tiền phải trả
        type: Number,
        required: true,
        default: 0.0
    },
    couponCode: { // Mã giảm giá đã áp dụng (nếu có)
        type: String,
        default: null,
    },
    discountAmount: { // Số tiền được giảm
        type: Number,
        default: 0,
    },
    paymentMethod: { // COD hoặc MoMo
        type: String,
        required: true,
        default: 'COD'
    },
    isPaid: { // Trạng thái đã thanh toán hay chưa
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: { // Thời gian thanh toán thành công
        type: Date
    },
    status: { // Trạng thái đơn hàng
        type: String,
        required: true,
        default: 'Chờ xử lý', // VD: Chờ xử lý, Đang giao, Đã giao thành công
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
