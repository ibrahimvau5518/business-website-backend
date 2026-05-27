const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('MongoDB is already connected');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = conn.connection.readyState === 1;
        console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
    } catch (err) {
        console.error(`MongoDB Connection Error: ${err.message}`);
        // Remove process.exit(1) for Vercel serverless environment
        // process.exit(1); 
    }
};

module.exports = connectDB;