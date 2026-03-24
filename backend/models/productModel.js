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
    discount: {
        type: Number,
        default: 20 // Phần trăm giảm giá (VD: 20 = giảm 20%). Mặc định 20%
    },
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
