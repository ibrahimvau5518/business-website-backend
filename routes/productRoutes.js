const express = require('express');
const router = express.Router();
const { getProducts, createProduct } = require('../controllers/productController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getProducts)
    .post(protect, isAdmin, createProduct);

module.exports = router;