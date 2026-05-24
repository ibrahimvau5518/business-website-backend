const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    iconUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);