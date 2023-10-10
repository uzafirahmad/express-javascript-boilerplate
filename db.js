const mongoose = require('mongoose');
const { ServerApiVersion } = require("mongodb");

const uri =
  "mongodb+srv://uzafirahmad:a1ab2bc3cd4d@testing.faqw1hv.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp";

async function connectToDatabase() {
    try {
        // Use mongoose to connect
        await mongoose.connect(uri, {
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

module.exports = connectToDatabase;

