const mongoose = require('mongoose');
const Order = require('../models/Order');

const STATUS_FLOW = {
    pending: 'confirmed',
    confirmed: 'shipped',
    shipped: 'delivered'
};

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered'];

const isPositiveNumber = (value) => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
};

const isNonNegativeNumber = (value) => {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
};

const createOrder = async (req, res) => {
    try {
        const {
            name,
            phone,
            address,
            productId,
            productName,
            category,
            quantity,
            unitPrice,
            pricePerSqFt,
            length,
            width,
            area,
            price,
            transactionId,
        } = req.body;

        const missingFields = [];
        if (!name?.trim()) missingFields.push('name');
        if (!phone?.trim()) missingFields.push('phone');
        if (!address?.trim()) missingFields.push('address');
        if (!productName?.trim()) missingFields.push('productName');
        if (price === undefined || price === null || price === '') missingFields.push('price');
        if (!transactionId?.trim()) missingFields.push('transactionId');

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        if (!isNonNegativeNumber(price)) {
            return res.status(400).json({ message: 'price must be a valid non-negative number' });
        }

        if (category && !['crane-parts', 'tarpaulin'].includes(category)) {
            return res.status(400).json({ message: 'category must be crane-parts or tarpaulin' });
        }

        if (category === 'tarpaulin') {
            if (!isPositiveNumber(length) || !isPositiveNumber(width)) {
                return res.status(400).json({ message: 'length and width are required for tarpaulin orders' });
            }
            if (!isPositiveNumber(area)) {
                return res.status(400).json({ message: 'area must be a positive number for tarpaulin orders' });
            }
            if (!isNonNegativeNumber(pricePerSqFt)) {
                return res.status(400).json({ message: 'pricePerSqFt must be a valid non-negative number' });
            }
        }

        if (category === 'crane-parts') {
            if (!isPositiveNumber(quantity)) {
                return res.status(400).json({ message: 'quantity must be a positive number for crane-parts orders' });
            }
            if (!isNonNegativeNumber(unitPrice)) {
                return res.status(400).json({ message: 'unitPrice must be a valid non-negative number' });
            }
        }

        const orderData = {
            userId: req.user._id,
            name: name.trim(),
            phone: phone.trim(),
            address: address.trim(),
            productName: productName.trim(),
            price: Number(price),
            transactionId: transactionId.trim(),
        };

        if (productId?.trim()) orderData.productId = productId.trim();
        if (category) orderData.category = category;
        if (quantity != null && quantity !== '') orderData.quantity = Number(quantity);
        if (unitPrice != null && unitPrice !== '') orderData.unitPrice = Number(unitPrice);
        if (pricePerSqFt != null && pricePerSqFt !== '') orderData.pricePerSqFt = Number(pricePerSqFt);
        if (length != null && length !== '') orderData.length = Number(length);
        if (width != null && width !== '') orderData.width = Number(width);
        if (area != null && area !== '') orderData.area = Number(area);

        const order = await Order.create(orderData);

        res.status(201).json(order);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        if (!status) {
            return res.status(400).json({ message: 'status is required' });
        }

        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const allowedNextStatus = STATUS_FLOW[order.status];
        if (!allowedNextStatus || status !== allowedNextStatus) {
            return res.status(400).json({
                message: `Invalid status transition. Current status is "${order.status}", expected "${allowedNextStatus || 'none (order already delivered)'}"`
            });
        }

        order.status = status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid order ID' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, getUserOrders, getAllOrders, updateOrderStatus };