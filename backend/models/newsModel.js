const mongoose = require('mongoose');

const newsSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tag: {
        type: String,
        default: 'Mới',
    },
    tagColor: {
        type: String,
        default: 'danger',
    }
}, {
    timestamps: true,
});

const News = mongoose.model('News', newsSchema);
module.exports = News;
