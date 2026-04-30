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

// @desc    Lấy toàn bộ tin nhắn liên hệ (Dành cho Admin)
// @route   GET /api/contacts
// @access  Private/Admin
const getContacts = asyncHandler(async (req, res) => {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    res.json(contacts);
});

// @desc    Xóa tin nhắn liên hệ
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
const deleteContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    if (contact) {
        await contact.deleteOne();
        res.json({ message: 'Đã xóa tin nhắn liên hệ!' });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy tin nhắn!');
    }
});

module.exports = { createContact, getContacts, deleteContact };
