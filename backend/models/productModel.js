const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    image: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        default: 'Smartphone'
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },

    isHidden: {
        type: Boolean,
        default: false
    },
    discount: {
        type: Number,
        default: 0
    },
    tags: {
        type: [String],
        default: []
    },
    
    // MÔ HÌNH BIẾN THỂ KẾT HỢP
    variants: [{
        color: { type: String, required: true },
        colorCode: { type: String, default: '#000000' },
        image: { type: String, required: true },
        ram: { type: String, required: true },
        rom: { type: String, required: true },
        price: { type: Number, required: true },
        countInStock: { type: Number, default: 0 }
    }],

    specs: {
        ram: { type: String },
        rom: { type: String },
        chip: { type: String },
        battery: { type: String }
    },
    description: { 
        type: String
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
