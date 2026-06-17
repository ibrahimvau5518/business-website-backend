const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    category: {
        type: String,
        enum: ['crane-parts', 'tarpaulin'],
        required: true,
        default: 'crane-parts'
    },
    pricePerSqFt: {
        type: Number,
        min: 0,
        default: null
    },
    stockStatus: {
        type: String,
        enum: ['in-stock', 'out-of-stock'],
        default: 'in-stock'
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);