const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Service = require('../models/Service');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const services = await Service.find({});
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', protect, async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;