const express = require('express');
const router = express.Router();
const { createContact, getContacts, deleteContact } = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

// POST /api/contacts — Gửi tin nhắn liên hệ (công khai, không cần đăng nhập)
router.post('/', createContact);

// GET /api/contacts — Lấy toàn bộ tin nhắn (Admin)
router.get('/', protect, admin, getContacts);

// DELETE /api/contacts/:id — Xóa tin nhắn (Admin)
router.delete('/:id', protect, admin, deleteContact);

module.exports = router;
