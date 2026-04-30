const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
    const { orderItems, shippingAddress, totalPrice, paymentMethod, couponCode, discountAmount } = req.body;

    // Kiểm tra có sản phẩm trong đơn không
    if (!orderItems || orderItems.length === 0) {
        res.status(400);
        throw new Error('Đơn hàng không có sản phẩm nào!');
    }

    // Tạo đơn hàng mới trong Database
    const order = new Order({
        user: req.user._id,
        orderItems,
        shippingAddress,
        totalPrice,
        paymentMethod: paymentMethod || 'COD',
        couponCode: couponCode || null,
        discountAmount: discountAmount || 0,
        isPaid: false,
        status: 'Chờ xử lý'
    });

    const createdOrder = await order.save();

    // Tăng số lượt đã dùng của mã giảm giá nếu có áp dụng
    if (couponCode) {
        await Coupon.findOneAndUpdate(
            { code: couponCode.toUpperCase() },
            { $inc: { usedCount: 1 } }
        );
    }

    // Tự động trừ số lượng Tồn Kho khi có người đặt mua
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
            // Nếu item có biến thể ROM → trừ tồn kho của biến thể
            if (item.storageLabel && product.storageVariants && product.storageVariants.length > 0) {
                const variant = product.storageVariants.find(v => v.label === item.storageLabel);
                if (variant) {
                    variant.countInStock = Math.max(0, variant.countInStock - item.qty);
                }
            } else {
                // Sản phẩm không có biến thể → trừ tồn kho gốc
                product.countInStock = Math.max(0, product.countInStock - item.qty);
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

// @desc    Hủy đơn hàng (Dành cho Người dùng)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // Kiểm tra quyền sở hữu: Phải là đơn của chính mình mới được hủy
        if (order.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Bạn không có quyền hủy đơn hàng này!');
        }

        // Kiểm tra quy tắc hủy
        if (order.status === 'Đã hủy') {
            res.status(400);
            throw new Error('Đơn hàng đã được hủy trước đó.');
        }

        // Quy tắc 1: COD chỉ được hủy khi chưa giao ĐVVC (Chờ xử lý)
        if (order.paymentMethod === 'COD' && order.status !== 'Chờ xử lý') {
            res.status(400);
            throw new Error('Không thể hủy đơn hàng COD đã được bàn giao vận chuyển.');
        }

        // Quy tắc 2: VNPay đã thanh toán thì không được tự hủy
        if (order.paymentMethod === 'VNPay' && order.isPaid) {
            res.status(400);
            throw new Error('Không thể tự hủy đơn hàng đã thanh toán qua VNPay. Vui lòng liên hệ Shop để được hoàn tiền.');
        }

        // Quy tắc 3: Nếu là trạng thái khác (Đang giao, Thành công) thì cũng chặn luôn
        if (order.status !== 'Chờ xử lý' && order.paymentMethod !== 'VNPay') {
            res.status(400);
            throw new Error('Trạng thái đơn hàng hiện tại không cho phép hủy.');
        }

        order.status = 'Đã hủy';
        const updatedOrder = await order.save();

        // NGHIỆP VỤ QUAN TRỌNG: Trả lại tồn kho
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                // Nếu item có biến thể ROM → cộng lại tồn kho của biến thể
                if (item.storageLabel && product.storageVariants && product.storageVariants.length > 0) {
                    const variant = product.storageVariants.find(v => v.label === item.storageLabel);
                    if (variant) {
                        variant.countInStock += item.qty;
                    }
                } else {
                    product.countInStock += item.qty;
                }
                await product.save();
            }
        }

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng!');
    }
});

module.exports = { createOrder, getMyOrders, getOrders, updateOrderStatus, cancelOrder };
