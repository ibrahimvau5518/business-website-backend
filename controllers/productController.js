const mongoose = require('mongoose');
const Product = require('../models/Product');

const VALID_STOCK_STATUSES = ['in-stock', 'out-of-stock'];
const VALID_CATEGORIES = ['crane-parts', 'tarpaulin'];

const resolvePricing = (category, price, pricePerSqFt) => {
    if (category === 'tarpaulin') {
        if (pricePerSqFt === undefined || pricePerSqFt === null || pricePerSqFt === '') {
            return { error: 'pricePerSqFt is required for tarpaulin products' };
        }
        const parsed = Number(pricePerSqFt);
        if (isNaN(parsed) || parsed < 0) {
            return { error: 'pricePerSqFt must be a valid non-negative number' };
        }
        return { price: parsed, pricePerSqFt: parsed };
    }

    if (price === undefined || price === null || price === '') {
        return { error: 'price is required for crane-parts products' };
    }
    const parsed = Number(price);
    if (isNaN(parsed) || parsed < 0) {
        return { error: 'price must be a valid non-negative number' };
    }
    return { price: parsed, pricePerSqFt: null };
};

const getProducts = async (req, res) => {
    console.log('[DEBUG getProducts] route entered');

    try {
        console.log('[DEBUG getProducts] before Product.find()');
        const products = await Product.find({}).sort({ createdAt: -1 });
        console.log(`[DEBUG getProducts] after Product.find() — count: ${products.length}`);
        console.log('[DEBUG getProducts] before res.json()');
        res.json(products);
    } catch (error) {
        console.error(`[DEBUG getProducts] error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, price, description, image, stockStatus, category, pricePerSqFt } = req.body;

        const missingFields = [];
        if (!name?.trim()) missingFields.push('name');
        if (!description?.trim()) missingFields.push('description');
        if (!category) missingFields.push('category');

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        if (!VALID_CATEGORIES.includes(category)) {
            return res.status(400).json({
                message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`
            });
        }

        const pricing = resolvePricing(category, price, pricePerSqFt);
        if (pricing.error) {
            return res.status(400).json({ message: pricing.error });
        }

        if (stockStatus && !VALID_STOCK_STATUSES.includes(stockStatus)) {
            return res.status(400).json({
                message: `Invalid stockStatus. Must be one of: ${VALID_STOCK_STATUSES.join(', ')}`
            });
        }

        const product = await Product.create({
            name: name.trim(),
            description: description.trim(),
            category,
            price: pricing.price,
            pricePerSqFt: pricing.pricePerSqFt,
            image: image?.trim() || '',
            stockStatus: stockStatus || 'in-stock'
        });

        res.status(201).json(product);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, image, stockStatus, category, pricePerSqFt } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (name !== undefined) {
            if (!name?.trim()) {
                return res.status(400).json({ message: 'name cannot be empty' });
            }
            product.name = name.trim();
        }

        if (description !== undefined) {
            if (!description?.trim()) {
                return res.status(400).json({ message: 'description cannot be empty' });
            }
            product.description = description.trim();
        }

        if (category !== undefined) {
            if (!VALID_CATEGORIES.includes(category)) {
                return res.status(400).json({
                    message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`
                });
            }
            product.category = category;
        }

        const categoryToValidate = category ?? product.category;
        const shouldValidatePricing =
            category !== undefined ||
            price !== undefined ||
            pricePerSqFt !== undefined;

        if (shouldValidatePricing) {
            const pricing = resolvePricing(
                categoryToValidate,
                price !== undefined ? price : product.price,
                pricePerSqFt !== undefined
                    ? pricePerSqFt
                    : categoryToValidate === 'tarpaulin'
                    ? product.pricePerSqFt
                    : product.price
            );

            if (pricing.error) {
                return res.status(400).json({ message: pricing.error });
            }

            product.price = pricing.price;
            product.pricePerSqFt = pricing.pricePerSqFt;
        }

        if (image !== undefined) {
            product.image = image?.trim() || '';
        }

        if (stockStatus !== undefined) {
            if (!VALID_STOCK_STATUSES.includes(stockStatus)) {
                return res.status(400).json({
                    message: `Invalid stockStatus. Must be one of: ${VALID_STOCK_STATUSES.join(', ')}`
                });
            }
            product.stockStatus = stockStatus;
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully', product });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };