const express = require('express');
const multer = require('multer');
const path = require('path');
const { protectFirebase } = require('../middleware/authMiddleware');
const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpg|jpeg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Images only!');
        }
    }
});

router.post('/', protectFirebase, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // In production Vercel apps, consider using AWS S3, Cloudinary, etc., as Vercel file system is read-only in functions.
    res.json({ imageUrl: `/${req.file.path.replace('\\', '/')}` });
});

module.exports = router;