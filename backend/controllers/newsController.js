const asyncHandler = require('express-async-handler');
const News = require('../models/newsModel');

// @desc    Lấy toàn bộ tin tức
// @route   GET /api/news
// @access  Public
const getNews = asyncHandler(async (req, res) => {
    const news = await News.find({})
        .populate('author', 'name')
        .sort({ createdAt: -1 });
    res.json(news);
});

// @desc    Lấy chi tiết 1 tin tức
// @route   GET /api/news/:id
// @access  Public
const getNewsById = asyncHandler(async (req, res) => {
    const news = await News.findById(req.params.id).populate('author', 'name');
    if (news) {
        res.json(news);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy bài viết!');
    }
});

// @desc    Tạo bài viết mới
// @route   POST /api/news
// @access  Private/Admin
const createNews = asyncHandler(async (req, res) => {
    const { title, category, image, description, content, tag, tagColor } = req.body;

    const news = new News({
        title,
        category,
        image,
        description,
        content,
        tag,
        tagColor,
        author: req.user._id, // Lấy ID Admin đang đăng nhập
    });

    const createdNews = await news.save();
    res.status(201).json(createdNews);
});

// @desc    Xóa bài viết
// @route   DELETE /api/news/:id
// @access  Private/Admin
const deleteNews = asyncHandler(async (req, res) => {
    const news = await News.findById(req.params.id);
    if (news) {
        await news.deleteOne();
        res.json({ message: 'Đã xóa bài viết!' });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy bài viết!');
    }
});

module.exports = {
    getNews,
    getNewsById,
    createNews,
    deleteNews
};
