import mongoose from 'mongoose';

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

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

export default RefreshToken