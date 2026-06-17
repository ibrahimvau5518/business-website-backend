const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    productId: { type: String },
    productName: { type: String, required: true },
    category: {
        type: String,
        enum: ['crane-parts', 'tarpaulin'],
    },
    quantity: { type: Number, min: 1 },
    unitPrice: { type: Number, min: 0 },
    pricePerSqFt: { type: Number, min: 0 },
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    area: { type: Number, min: 0 },
    price: { type: Number, required: true },
    transactionId: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);