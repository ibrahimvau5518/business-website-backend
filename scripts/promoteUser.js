/**
 * Promote a user to admin by email.
 * Usage: node scripts/promoteUser.js user@example.com
 */
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

const promoteUser = async () => {
    const email = process.argv[2]?.trim().toLowerCase();

    if (!email) {
        console.error('Usage: node scripts/promoteUser.js <email>');
        process.exit(1);
    }

    try {
        await connectDB();

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`No user found with email: ${email}`);
            console.error('The user must register first, then you can promote them.');
            process.exit(1);
        }

        if (user.role === 'admin') {
            console.log(`"${email}" is already an admin.`);
            process.exit(0);
        }

        user.role = 'admin';
        await user.save();

        console.log(`Promoted "${email}" to admin successfully.`);
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

promoteUser();