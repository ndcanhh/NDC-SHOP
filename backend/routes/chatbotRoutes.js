const express = require('express');
const router = express.Router();
const { chatWithAI, getHistory, saveHistory } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', chatWithAI);
router.get('/history', protect, getHistory);
router.post('/save', protect, saveHistory);

module.exports = router;
