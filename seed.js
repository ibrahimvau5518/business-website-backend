const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Admin = require('./models/Admin');

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = 'admin@craneparts.com';
        const adminPassword = 'adminpassword123';

        const existingUser = await User.findOne({ email: adminEmail });
        if (existingUser) {
            if (existingUser.role !== 'admin') {
                existingUser.role = 'admin';
                await existingUser.save();
                console.log(`Updated existing user "${adminEmail}" to admin role.`);
            } else {
                console.log(`Admin user "${adminEmail}" already exists.`);
            }
            process.exit(0);
        }

        const legacyAdmin = await Admin.findOne({ email: adminEmail });
        if (legacyAdmin) {
            await User.create({
                name: 'Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
            });
            console.log(`Migrated legacy admin "${adminEmail}" to users collection.`);
            process.exit(0);
        }

        await User.create({
            name: 'Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
        });

        console.log(`Admin user created: ${adminEmail}`);
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();