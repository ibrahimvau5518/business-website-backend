const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const getMongoUri = () => {
    const uri = process.env.MONGO_URI?.trim().replace(/;+$/, '');
    if (!uri) {
        throw new Error('MONGO_URI is not defined');
    }
    return uri;
};

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const uri = getMongoUri();

        cached.promise = mongoose.connect(uri, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
            socketTimeoutMS: 10000,
        }).then((mongooseInstance) => {
            console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.promise = null;
        console.error(`MongoDB Connection Error: ${err.message}`);
        throw err;
    }

    return cached.conn;
};

module.exports = connectDB;