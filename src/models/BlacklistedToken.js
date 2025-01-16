import mongoose from 'mongoose';

// Blacklisted Token Schema
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

const BlacklistedToken = mongoose.model('BlacklistedToken', BlacklistedTokenSchema);

export default BlacklistedToken