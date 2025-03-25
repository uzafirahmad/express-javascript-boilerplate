// config/prisma.js
import { PrismaClient } from '@prisma/client';

class PostgreSQLService {
    #prisma;

    constructor() {
        this.#prisma = new PrismaClient();
    }

    async connect() {
        try {
            await this.#prisma.$connect();
            console.log("Successfully connected to PostgreSQL!");
            return this.#prisma;
        } catch (error) {
            console.error("Error connecting to PostgreSQL:", error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.#prisma.$disconnect();
            console.log("Disconnected from PostgreSQL");
        } catch (error) {
            console.error("Error disconnecting from PostgreSQL:", error);
            throw error;
        }
    }

    getPrisma() {
        return this.#prisma;
    }
}

const postgreSQLService = new PostgreSQLService();
export default postgreSQLService;