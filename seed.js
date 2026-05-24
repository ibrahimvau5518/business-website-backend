const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        // Check if admin already exists
        const adminExists = await Admin.findOne({ email: 'admin@craneparts.com' });
        if (adminExists) {
            console.log('Admin already exists!');
            process.exit();
        }

        // Create a basic admin
        await Admin.create({
            email: 'admin@craneparts.com',
            password: 'adminpassword123' // This will be hashed automatically by the model
        });

        console.log('Admin created successfully! Collection "admins" has been created.');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();