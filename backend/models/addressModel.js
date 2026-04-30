const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    recipientName: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    isDefault: {
        type: Boolean,
        required: true,
        default: false,
    }
}, {
    timestamps: true
});

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;
