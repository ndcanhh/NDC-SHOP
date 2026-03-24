const express = require('express');
const router = express.Router();
const { createContact } = require('../controllers/contactController');

// POST /api/contacts — Gửi tin nhắn liên hệ (công khai, không cần đăng nhập)
router.post('/', createContact);

module.exports = router;
