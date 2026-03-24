const mongoose = require('mongoose');

// Quyển sổ lưu trữ lại những đoạn chat giữa Khách - Chatbot để làm dữ liệu train AI hoặc tra cứu
const chatHistorySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Không bắt buộc, có thể Khách chưa đăng nhập cũng được bật Chatbot để tư vấn
    },
    sessionId: {
        type: String, 
        required: true // Chuỗi mã bí mật (Cookie) để phân biệt giữa các khách vãng lai với nhau
    },
    messages: [ // Một hội thoại có nhiều tin nhắn qua lại
        {
            sender: { type: String, required: true }, // Sẽ là "user" hoặc "bot"
            content: { type: String, required: true }, // Nội dung nói cái gì
            timestamp: { type: Date, default: Date.now } // Thời gian nhắn tin đó
        }
    ]
}, {
    timestamps: true
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
module.exports = ChatHistory;
