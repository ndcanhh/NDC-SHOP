const mongoose = require('mongoose');

// Quyển sổ chứa toàn bộ mặt hàng điện thoại
const productSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String, 
        required: true // Bắt buộc có link hình ảnh
    },
    brand: { 
        type: String, 
        required: true // Hãng sản xuất (VD: Apple, Samsung, Xiaomi)
    },
    price: { 
        type: Number, 
        required: true, 
        default: 0 // Giá bán (mặc định là 0 nếu quên nhập) 
    },
    countInStock: { 
        type: Number, 
        required: true, 
        default: 0 // Số lượng hàng tồn trong kho
    },
    isHidden: {
        type: Boolean,
        default: false // Cờ ẩn sản phẩm khỏi website (dành cho admin)
    },
    discount: {
        type: Number,
        default: 0 // Phần trăm giảm giá (VD: 20 = giảm 20%). Mặc định 0% (không giảm)
    },
    tags: {
        type: [String],
        default: [] // Mảng chứa các tag, vd: ['Hot', 'Gaming']
    },
    colorVariants: [{ // Biến thể Màu sắc — Đổi ảnh khi chọn
        color: { type: String, required: true },      // VD: "Đen Titan"
        colorCode: { type: String, default: '#000' },  // Mã hex để hiển thị nút tròn
        image: { type: String, required: true }         // Ảnh riêng cho màu này
    }],
    storageVariants: [{ // Biến thể RAM/ROM — Đổi giá + tồn kho riêng
        label: { type: String, required: true },    // VD: "8GB/128GB"
        price: { type: Number, required: true },    // Giá riêng cho phiên bản này
        countInStock: { type: Number, default: 0 }  // Tồn kho riêng
    }],
    specs: { // Lưu trữ riêng một cục dữ liệu về Cấu Hình
        ram: { type: String },
        rom: { type: String },
        chip: { type: String },
        battery: { type: String }
    },
    description: { 
        type: String // Mô tả văn bản chi tiết về sản phẩm
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
