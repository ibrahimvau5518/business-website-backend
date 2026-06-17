const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const ensureDb = require('./middleware/dbMiddleware');

dotenv.config();


const admin = require('firebase-admin');

// Vercel Environment Variable থেকে JSON পার্স করে নেওয়া
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Firebase Service Account JSON parse error. Please check Vercel Env Variable format.", error.message);
  }
} else {
  try {
    // লোকালহোস্টের জন্য
    serviceAccount = require('./firebaseServiceAccount.json');
  } catch (error) {
    console.warn("Firebase file not found and FIREBASE_SERVICE_ACCOUNT env is not set.");
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'https://cranepartsandtarpaulin.netlify.app' 
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

app.use('/api', ensureDb);

app.use('/api/auth', require('./routes/authRoutes'));
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

// Vercel invokes the exported app as a serverless handler — do not bind a port there.
if (!process.env.VERCEL) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} else {
    console.log('[DEBUG server] Express app exported for Vercel serverless');
}

module.exports = app;