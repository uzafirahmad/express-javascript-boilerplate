const express = require("express");
const connectToDatabase = require("./db");
const cors = require('cors');
const { redisConnection } = require("./redis");

const port = 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json())

//database connection
connectToDatabase();

//redis connection
redisConnection();

// Available Routes
app.use('/auth', require('./authentication/Urls'))
app.use('/crud', require('./crud/Urls'))


// Run Server on specified port
app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
