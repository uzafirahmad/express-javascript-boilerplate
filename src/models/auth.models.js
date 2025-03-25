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
    joined_at: {
        type: Date,
        default: Date.now
    },
    token_version: {
        type: String,
        required: true,
        default: () => crypto.randomBytes(16).toString('hex')
    },
    oauth: {
        google_id: {
            type: String,
            default: null
        }
    },
    account_type: {
        type: String,
        default: "normal"
    },
    password_reset_token: {
        type: String,
        default: ""
    },
});

const BlacklistedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    date_added: {
        type: Date,
        default: Date.now
    },
    created_at: {
        type: Date,
        default: Date.now,
        expires: 7 * 24 * 60 * 60
    }
});

export const BlacklistedToken = mongoose.model('BlacklistedToken', BlacklistedTokenSchema);
export const User = mongoose.model('User', UserSchema);