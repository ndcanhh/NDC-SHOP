const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            color: { type: String },
            storageLabel: { type: String },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            }
        }
    ],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        phone: { type: String, required: true }
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    couponCode: { 
        type: String,
        default: null,
    },
    discountAmount: { 
        type: Number,
        default: 0,
    },
    paymentMethod: { 
        type: String,
        required: true,
        default: 'COD'
    },
    isPaid: { 
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: { 
        type: Date
    },
    status: { 
        type: String,
        required: true,
        default: 'Chờ xử lý'
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
