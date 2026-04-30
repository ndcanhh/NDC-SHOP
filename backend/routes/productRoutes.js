const express = require('express');
const router = express.Router();
const { getProducts, getAdminProducts, getProductById, searchProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Biển báo Tìm kiếm: GET /api/products/search?keyword=iphone
router.route('/search').get(searchProducts);

// GET tất cả sản phẩm (bao gồm cả ẩn) cho Admin
router.route('/admin/all').get(protect, admin, getAdminProducts);

// GET tất cả sản phẩm đang bán, POST tạo sản phẩm mới (chỉ Admin)
router.route('/')
    .get(getProducts)
    .post(protect, admin, createProduct);

// Cập nhật, Xóa (chỉ Admin), và Xem chi tiết (Ai cũng xem được)
router.route('/:id')
    .get(getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;
