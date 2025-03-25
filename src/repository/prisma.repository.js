import postgreSQLService from "../config/postgresql.js";

class PrismaRepository {
    #prisma;
    #model;

    constructor(model) {
        this.#prisma = postgreSQLService.getPrisma();
        this.#model = model;
    }

    async find(filter, include = {}, select = {}, options = {}) {
        try {
            const query = {
                where: filter,
                include: Object.keys(include).length ? include : undefined,
                select: Object.keys(select).length ? select : undefined,
            };

            if (options.sort) {
                query.orderBy = options.sort;
            }

            return await this.#prisma[this.#model].findMany(query);
        } catch (error) {
            throw new Error(`Error in find operation: ${error.message}`);
        }
    }

    async findOne(filter, include = {}, select = {}) {
        try {
            return await this.#prisma[this.#model].findFirst({
                where: filter,
                include: Object.keys(include).length ? include : undefined,
                select: Object.keys(select).length ? select : undefined,
            });
        } catch (error) {
            throw new Error(`Error in findOne operation: ${error.message}`);
        }
    }

    async findById(id, include = {}, select = {}) {
        try {
            return await this.#prisma[this.#model].findUnique({
                where: { id },
                include: Object.keys(include).length ? include : undefined,
                select: Object.keys(select).length ? select : undefined,
            });
        } catch (error) {
            throw new Error(`Error in findById operation: ${error.message}`);
        }
    }

    async create(data) {
        try {
            return await this.#prisma[this.#model].create({
                data,
            });
        } catch (error) {
            throw new Error(`Error in create operation: ${error.message}`);
        }
    }

    async createMany(data, options = {}) {
        try {
            return await this.#prisma[this.#model].createMany({
                data,
                skipDuplicates: options.skipDuplicates || false,
            });
        } catch (error) {
            throw new Error(`Error in createMany operation: ${error.message}`);
        }
    }

    async deleteOne(filter) {
        try {
            return await this.#prisma[this.#model].delete({
                where: filter,
            });
        } catch (error) {
            throw new Error(`Error in deleteOne operation: ${error.message}`);
        }
    }

    async deleteMany(filter) {
        try {
            return await this.#prisma[this.#model].deleteMany({
                where: filter,
            });
        } catch (error) {
            throw new Error(`Error in deleteMany operation: ${error.message}`);
        }
    }

    async deleteAll() {
        try {
            return await this.#prisma[this.#model].deleteMany({});
        } catch (error) {
            throw new Error(`Error in deleteAll operation: ${error.message}`);
        }
    }

    async updateOne(filter, update) {
        try {
            return await this.#prisma[this.#model].update({
                where: filter,
                data: update,
            });
        } catch (error) {
            throw new Error(`Error in updateOne operation: ${error.message}`);
        }
    }

    async updateMany(filter, update) {
        try {
            return await this.#prisma[this.#model].updateMany({
                where: filter,
                data: update,
            });
        } catch (error) {
            throw new Error(`Error in updateMany operation: ${error.message}`);
        }
    }

    async findAll() {
        return await this.#prisma[this.#model].findMany();
    }
}

export default PrismaRepository;