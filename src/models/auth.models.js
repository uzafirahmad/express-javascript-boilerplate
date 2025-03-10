import mongoose from 'mongoose';
import crypto from 'crypto'

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    tokenVersion: {
        type: String,
        required: true,
        default: () => crypto.randomBytes(16).toString('hex')
    },
});

const BlacklistedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    dateAdded: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 7 * 24 * 60 * 60
    }
});

export const BlacklistedToken = mongoose.model('BlacklistedToken', BlacklistedTokenSchema);
export const User = mongoose.model('User', UserSchema);