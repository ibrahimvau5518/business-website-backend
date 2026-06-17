const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .post(createOrder)
    .get(protectAdmin, getAllOrders);

router.route('/:id')
    .patch(protectAdmin, updateOrderStatus);

module.exports = router;