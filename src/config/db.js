import mongoose from 'mongoose';
import { ServerApiVersion } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();

// Generate connection URL from MongoDB Atlas website
const url = process.env.DATABASE_URL;

async function connectToDatabase() {
    try {
        // Use mongoose to connect
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true
            }
        });

        console.log("You successfully connected to MongoDB using Mongoose!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

export default connectToDatabase
