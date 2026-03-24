const mongoose = require('mongoose');

// Quyển sổ lưu lại các tin nhắn liên hệ từ khách hàng
const contactSchema = mongoose.Schema({
    name: {
        type: String,
        required: true // Tên người gửi
    },
    email: {
        type: String,
        required: true // Email để phản hồi
    },
    message: {
        type: String,
        required: true // Nội dung tin nhắn
    },
    isRead: {
        type: Boolean,
        default: false // Admin đã đọc chưa
    }
}, {
    timestamps: true
});

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;
