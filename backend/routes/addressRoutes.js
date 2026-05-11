const express = require('express');
const axios = require('axios');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} = require('../controllers/addressController');

// Proxy API lấy danh sách tỉnh thành
router.get('/provinces', async (req, res) => {
    try {
        const { data } = await axios.get('https://provinces.open-api.vn/api/v2/p/', { timeout: 5000 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Không thể lấy dữ liệu tỉnh thành v2', error: error.message });
    }
});

// Proxy lấy danh sách phường xã theo mã tỉnh
router.get('/wards/:provinceCode', async (req, res) => {
    try {
        const { provinceCode } = req.params;
        const { data } = await axios.get(`https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`, { timeout: 5000 });
        res.json(data.wards || []);
    } catch (error) {
        res.status(500).json({ message: 'Không thể lấy dữ liệu phường xã', error: error.message });
    }
});

router.route('/')
    .get(protect, getAddresses)
    .post(protect, createAddress);

router.route('/:id')
    .put(protect, updateAddress)
    .delete(protect, deleteAddress);

router.route('/:id/default')
    .put(protect, setDefaultAddress);

module.exports = router;
