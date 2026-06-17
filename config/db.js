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
    console.log('[DEBUG connectDB] function started');

    if (cached.conn) {
        console.log('[DEBUG connectDB] returning cached connection');
        return cached.conn;
    }

    if (!cached.promise) {
        const uri = getMongoUri();
        console.log('[DEBUG connectDB] before mongoose.connect');

        cached.promise = mongoose.connect(uri, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
        }).then((mongooseInstance) => {
            console.log(`[DEBUG connectDB] after successful connection: ${mongooseInstance.connection.host}`);
            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log('[DEBUG connectDB] connection resolved and cached');
    } catch (err) {
        cached.promise = null;
        console.error(`[DEBUG connectDB] connection error: ${err.message}`);
        throw err;
    }

    return cached.conn;
};

module.exports = connectDB;