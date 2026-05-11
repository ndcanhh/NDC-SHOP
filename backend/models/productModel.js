const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String, 
        required: true 
    },
    brand: { 
        type: String, 
        required: true
    },
    price: { 
        type: Number, 
        required: true, 
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
    colorVariants: [{
        color: { type: String, required: true },
        colorCode: { type: String, default: '#000' },
        image: { type: String, required: true }
    }],
    storageVariants: [{
        label: { type: String, required: true },
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
