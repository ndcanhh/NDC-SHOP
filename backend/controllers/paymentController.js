const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const { VNPay, ignoreLogger, ProductCode, VnpLocale } = require('vnpay');

// ======================================================
// CẤU HÌNH VNPAY SANDBOX
// Credentials sandbox từ tài liệu tích hợp VNPay
// ======================================================
const getVNPay = () => new VNPay({
    tmnCode: process.env.VNP_TMN_CODE || 'DEMOV210',
    secureSecret: process.env.VNP_HASH_SECRET || 'RAOEXHYVSDDIIENYWSLDIIZTACEODAAA',
    vnpayHost: 'https://sandbox.vnpayment.vn',
    testMode: true,           // Bật chế độ sandbox
    hashAlgorithm: 'SHA512',  // Thuật toán hash bắt buộc
    enableLog: true,          // Log để debug
    loggerFn: ignoreLogger,   // Dùng logger im lặng (không spam console)
});

// ===================================================================
// @desc    Tạo URL thanh toán VNPay
// @route   POST /api/payment/vnpay
// @access  Private
// ===================================================================
const createVNPayPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }

    const vnpay = getVNPay();

    // txnRef: chỉ alphanumeric, tối đa 100 ký tự, duy nhất mỗi giao dịch
    const txnRef = orderId.toString().slice(-8).toUpperCase() + Date.now().toString().slice(-4);

    const returnUrl = process.env.VNP_RETURN_URL || 'http://localhost:5173/orders';

    const payUrl = vnpay.buildPaymentUrl({
        vnp_Amount: Math.round(order.totalPrice),   // Package tự nhân 100
        vnp_IpAddr: '127.0.0.1',
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: `Thanh toan don hang NDC SHOP`,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: returnUrl,
        vnp_Locale: VnpLocale.VN,
        vnp_BankCode: 'NCB', // Nhảy thẳng qua bước chọn ngân hàng
    });

    console.log('[VNPay] txnRef:', txnRef, '| amount:', order.totalPrice);
    console.log('[VNPay] payUrl:', payUrl.substring(0, 120) + '...');

    // Lưu txnRef vào order để tra cứu khi callback
    order.vnpTxnRef = txnRef;
    await order.save();

    res.json({ payUrl, txnRef, orderId });
});

// ===================================================================
// @desc    Xác thực kết quả trả về từ VNPay
// @route   POST /api/payment/vnpay-verify
// @access  Private
// ===================================================================
const verifyVNPayReturn = asyncHandler(async (req, res) => {
    const vnpay = getVNPay();
    const params = req.body;

    let isValid = false;
    let responseCode = params['vnp_ResponseCode'];

    try {
        const result = vnpay.verifyReturnUrl(params);
        isValid = result.isVerified && result.isSuccess;
        console.log('[VNPay Verify] isVerified:', result.isVerified, '| isSuccess:', result.isSuccess);
    } catch (e) {
        console.error('[VNPay Verify Error]', e.message);
    }

    if (isValid || String(responseCode) === '00') {
        const txnRef = params['vnp_TxnRef'];
        const orders = await Order.find({});
        const matchedOrder = orders.find(
            (o) => o._id.toString().slice(-8).toUpperCase() === txnRef.slice(0, 8)
        );

        if (matchedOrder && !matchedOrder.isPaid) {
            matchedOrder.isPaid = true;
            matchedOrder.paidAt = Date.now();
            matchedOrder.paymentMethod = 'VNPay';
            await matchedOrder.save();
            return res.json({ message: 'Thanh toán VNPay thành công!', order: matchedOrder });
        }
        if (matchedOrder && matchedOrder.isPaid) {
            return res.json({ message: 'Đơn hàng đã được thanh toán.', order: matchedOrder });
        }
    }

    res.status(400);
    throw new Error('Giao dịch VNPay không hợp lệ hoặc bị từ chối');
});

module.exports = { createVNPayPayment, verifyVNPayReturn };
