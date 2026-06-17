const express = require('express');
const router = express.Router();
const {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
} = require('../controllers/orderController');
const { protect, protectAdmin } = require('../middleware/authMiddleware');

router.get('/user', protect, getUserOrders);

router.route('/')
    .post(protect, createOrder)
    .get(protectAdmin, getAllOrders);

router.route('/:id')
    .patch(protectAdmin, updateOrderStatus);

module.exports = router;