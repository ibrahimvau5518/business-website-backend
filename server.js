const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const ensureDb = require('./middleware/dbMiddleware');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://cranepartsandtarpaulin.netlify.app',
        'https://business-website-frontend.vercel.app',
        /\.vercel\.app$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', ensureDb);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

// Only bind a port when running directly (`node server.js`), not when imported by Vercel.
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;