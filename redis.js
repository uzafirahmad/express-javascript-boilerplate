const redis = require('redis');

const redisClient = redis.createClient({
    // url: "redis://redis:6379"
    host: 'localhost',
    port: 6379
});

async function redisConnection() {
    await redisClient.connect();
    console.log('Connected to Redis');
}

module.exports = { redisClient, redisConnection };