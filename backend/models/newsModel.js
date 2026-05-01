const mongoose = require('mongoose');

const newsSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true, // VD: Apple, Samsung, Thủ thuật
    },
    image: {
        type: String,
        default: '', // Ảnh bìa bài viết
    },
    description: {
        type: String,
        required: true, // Mô tả ngắn
    },
    content: {
        type: String,
        required: true, // Nội dung chi tiết (HTML hoặc Markdown)
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // Bài viết phải do Admin tạo
    },
    tag: {
        type: String,
        default: 'Mới', // VD: Mới, Hot, Đánh giá
    },
    tagColor: {
        type: String,
        default: 'danger', // primary, success, danger, warning...
    }
}, {
    timestamps: true,
});

const News = mongoose.model('News', newsSchema);
module.exports = News;
