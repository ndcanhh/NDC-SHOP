const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} = require('../controllers/addressController');

router.route('/')
    .get(protect, getAddresses)
    .post(protect, createAddress);

router.route('/:id')
    .put(protect, updateAddress)
    .delete(protect, deleteAddress);

router.route('/:id/default')
    .put(protect, setDefaultAddress);

module.exports = router;
