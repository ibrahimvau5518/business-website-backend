const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const VALID_ROLES = ['user', 'admin'];

const userSchema = mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    firebaseUid: { type: String, sparse: true },
    role: {
        type: String,
        enum: VALID_ROLES,
        default: 'user',
    },
}, { timestamps: true });

userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) {
        return false;
    }
    return bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
module.exports.VALID_ROLES = VALID_ROLES;