const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private (cần đăng nhập)
const createOrder = asyncHandler(async (req, res) => {
    const { orderItems, shippingAddress, totalPrice } = req.body;

    // Kiểm tra có sản phẩm trong đơn không
    if (!orderItems || orderItems.length === 0) {
        res.status(400);
        throw new Error('Đơn hàng không có sản phẩm nào!');
    }

    // Tạo đơn hàng mới trong Database
    const order = new Order({
        user: req.user._id, // Lấy ID user từ middleware protect
        orderItems,
        shippingAddress,
        totalPrice,
        status: 'Chờ xử lý'
    });

    const createdOrder = await order.save();

    // Tự động trừ số lượng Tồn Kho của kho hàng khi có người đặt mua
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
            product.countInStock = product.countInStock - item.qty;
            // Đảm bảo tồn kho không bao giờ bị âm
            if (product.countInStock < 0) {
                product.countInStock = 0;
            }
            await product.save();
        }
    }

    res.status(201).json(createdOrder);
});

// @desc    Lấy danh sách đơn hàng của user hiện tại
// @route   GET /api/orders/myorders
// @access  Private (cần đăng nhập)
const getMyOrders = asyncHandler(async (req, res) => {
    // Tìm tất cả đơn hàng thuộc về user này, sắp xếp mới nhất lên đầu
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Lấy danh sách tất cả đơn hàng (Cho Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Cập nhật trạng thái đơn hàng (Cho Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        const oldStatus = order.status;
        const newStatus = req.body.status || order.status;

        // NGHIỆP VỤ 1: Đơn hàng bị HỦY -> Trả lại số lượng tồn kho
        if (newStatus === 'Đã hủy' && oldStatus !== 'Đã hủy') {
            for (const item of order.orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.countInStock += item.qty;
                    await product.save();
                }
            }
        }

        // NGHIỆP VỤ 2: Đơn hàng khôi phục từ HỦY sang trạng thái khác -> Trừ lại tồn kho
        if (oldStatus === 'Đã hủy' && newStatus !== 'Đã hủy') {
            for (const item of order.orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.countInStock -= item.qty;
                    if (product.countInStock < 0) product.countInStock = 0;
                    await product.save();
                }
            }
        }

        order.status = newStatus;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng!');
    }
});

module.exports = { createOrder, getMyOrders, getOrders, updateOrderStatus };
