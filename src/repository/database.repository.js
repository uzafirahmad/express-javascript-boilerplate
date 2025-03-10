class DatabaseRepository {
    #model

    constructor(model) {
        this.#model = model;
    }

    async find(filter, populate = '', options = {}) {
        try {
            let query = this.#model.find(filter);

            if (populate && populate !== "") {
                query = query.populate(populate);
            }

            if (options.sort) {
                query = query.sort(options.sort);
            }

            return await query;
        } catch (error) {
            throw new Error(`Error in find operation: ${error.message}`);
        }
    }

    async findOne(filter, populate = '') {
        try {
            return (populate && populate !== "")
                ? await this.#model.findOne(filter).populate(populate)
                : await this.#model.findOne(filter);
        } catch (error) {
            throw new Error(`Error in findOne operation: ${error.message}`);
        }
    }

    async create(data) {
        try {
            return await this.#model.create(data);
        } catch (error) {
            throw new Error(`Error in create operation: ${error.message}`);
        }
    }

    async findById(id, populate = '') {
        try {
            return (populate && populate !== "")
                ? await this.#model.findById(id).populate(populate)
                : await this.#model.findById(id);
        } catch (error) {
            throw new Error(`Error in findById operation: ${error.message}`);
        }
    }

    async deleteOne(filter) {
        try {
            return await this.#model.deleteOne(filter);
        } catch (error) {
            throw new Error(`Error in deleteOne operation: ${error.message}`);
        }
    }

    async updateOne(filter, update) {
        try {
            return await this.#model.updateOne(filter, update);
        } catch (error) {
            throw new Error(`Error in updateOne operation: ${error.message}`);
        }
    }

    async findAll() {
        return await this.#model.find({});;
    }
}

export default DatabaseRepository;