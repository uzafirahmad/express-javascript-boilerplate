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

    // Create: Set a key-value pair with optional expiration
    async set(key, value, options = {}) {
        try {
            // Convert value to string if it's an object
            const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;

            // Set with optional expiration (in seconds)
            if (options.expiry) {
                await this.#client.set(key, stringValue, {
                    EX: options.expiry
                });
            } else {
                await this.#client.set(key, stringValue);
            }

            return true;
        } catch (error) {
            console.error(`Error setting key ${key}:`, error);
            throw error;
        }
    }

    // Read: Get a value by key
    async get(key, parse = false) {
        try {
            const value = await this.#client.get(key);

            // If parse is true and value looks like JSON, parse it
            if (parse && value && value.startsWith('{') && value.endsWith('}')) {
                return JSON.parse(value);
            }

            return value;
        } catch (error) {
            console.error(`Error getting key ${key}:`, error);
            throw error;
        }
    }

    // Update: Update a value, optionally creating if not exists
    async update(key, value, options = { createIfNotExists: true }) {
        try {
            // Check if key exists
            const exists = await this.#client.exists(key);

            if (exists || options.createIfNotExists) {
                const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
                await this.#client.set(key, stringValue);
                return true;
            }

            return false;
        } catch (error) {
            console.error(`Error updating key ${key}:`, error);
            throw error;
        }
    }

    // Delete: Remove a key
    async delete(key) {
        try {
            const result = await this.#client.del(key);
            return result > 0; // Returns true if key was deleted
        } catch (error) {
            console.error(`Error deleting key ${key}:`, error);
            throw error;
        }
    }

    // Check if a key exists
    async exists(key) {
        try {
            return await this.#client.exists(key) === 1;
        } catch (error) {
            console.error(`Error checking existence of key ${key}:`, error);
            throw error;
        }
    }

    // Set multiple key-value pairs at once
    async multiSet(keyValuePairs, options = {}) {
        try {
            const multi = this.#client.multi();

            for (const [key, value] of Object.entries(keyValuePairs)) {
                const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;

                if (options.expiry) {
                    multi.set(key, stringValue, { EX: options.expiry });
                } else {
                    multi.set(key, stringValue);
                }
            }

            return await multi.exec();
        } catch (error) {
            console.error('Error in multi-set operation:', error);
            throw error;
        }
    }
}

const redisService = new RedisService();
export default redisService;