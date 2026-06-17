const express = require('express');
const router = express.Router();
const {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getProducts)
    .post(protectAdmin, createProduct);

router.route('/:id')
    .patch(protectAdmin, updateProduct)
    .delete(protectAdmin, deleteProduct);

module.exports = router;