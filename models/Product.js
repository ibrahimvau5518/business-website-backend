const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number },
    stock: { type: Number, default: 0 },
    imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);