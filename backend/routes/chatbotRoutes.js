const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/chatbotController');

// POST /api/chatbot — Gửi tin nhắn cho AI (công khai, không cần đăng nhập)
router.post('/', chatWithAI);

module.exports = router;
