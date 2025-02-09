import mongoose from 'mongoose';

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
    date: {
        type: Date,
        default: Date.now
    }
});

const BlacklistedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    dateAdded: {
        type: Date,
        default: Date.now
    }
});

const RefreshTokenSchema = new mongoose.Schema({
    refreshToken: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expires: {
        type: Date,
        default: () => {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 10); // Add 10 days
            return currentDate;
        }
    }
});

export const BlacklistedToken = mongoose.model('BlacklistedToken', BlacklistedTokenSchema);
export const User = mongoose.model('User', UserSchema);
export const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);