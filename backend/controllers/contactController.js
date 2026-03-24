const asyncHandler = require('express-async-handler');
const Contact = require('../models/contactModel');

// @desc    Gửi tin nhắn liên hệ (lưu vào DB)
// @route   POST /api/contacts
// @access  Public (không cần đăng nhập)
const createContact = asyncHandler(async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        res.status(400);
        throw new Error('Vui lòng nhập đầy đủ họ tên, email và nội dung!');
    }

    const contact = await Contact.create({ name, email, message });

    res.status(201).json({
        message: 'Tin nhắn đã được gửi thành công!',
        contact,
    });
});

module.exports = { createContact };
