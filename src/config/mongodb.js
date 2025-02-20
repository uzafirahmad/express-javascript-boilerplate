import mongoose from 'mongoose';
import { ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class MongoDBService {
    #url;

    constructor() {
        this.#url = process.env.DATABASE_URL;
    }

    async connect() {
        try {
            await mongoose.connect(this.#url, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverApi: {
                    version: ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true,
                },
            });
            console.log("You successfully connected to MongoDB using Mongoose!");
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
            console.log("Disconnected from MongoDB");
        } catch (error) {
            console.error("Error disconnecting from MongoDB:", error);
            throw error;
        }
    }
}

// Export a singleton instance of MongoDBService
const mongoDBService = new MongoDBService();
export default mongoDBService;