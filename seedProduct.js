const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/Product');

dotenv.config();

const seedProduct = async () => {
    try {
        await connectDB();

        const product = await Product.create({
            name: 'Heavy Duty Crane Hook',
            description: 'A highly durable crane hook capable of lifting up to 50 tons. Made from high-grade steel.',
            category: 'Crane Parts',
            price: 2500,
            stock: 10,
            imageUrl: '/uploads/sample-hook.jpg' // Dummy image url
        });

        console.log('Product added successfully!');
        console.log(product);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedProduct();