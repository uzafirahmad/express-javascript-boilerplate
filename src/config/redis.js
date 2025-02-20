import redis from 'redis';

class RedisService {
    #client;

    constructor() {
        this.#client = redis.createClient({
            url: process.env.NODE_ENV === 'development' ? "" : "redis://redis:6379",
            host: process.env.NODE_ENV === 'development' ? "localhost" : "",
            port: 6379
        });
    }

    async connect() {
        try {
            await this.#client.connect();
            // Optionally, flush the database if needed
            // await this.#client.flushDb();
            console.log('Redis connected');
        } catch (error) {
            console.error('Error connecting to Redis:', error);
            throw error;
        }
    }

    async flushDatabase() {
        try {
            await this.#client.flushDb();
            console.log('Redis database flushed');
        } catch (error) {
            console.error('Error flushing Redis database:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.#client.disconnect();
            console.log('Redis disconnected');
        } catch (error) {
            console.error('Error disconnecting from Redis:', error);
            throw error;
        }
    }

    getClient() {
        return this.#client;
    }
}

const redisService = new RedisService();
export default redisService;