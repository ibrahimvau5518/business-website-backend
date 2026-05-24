const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Contact = require('../models/Contact');
const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        const serviceCount = await Service.countDocuments();
        const contactCount = await Contact.countDocuments();
        const unreadContacts = await Contact.countDocuments({ status: 'New' });

        res.json({
            products: productCount,
            services: serviceCount,
            contacts: contactCount,
            unreadContacts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;