// services/UserService.js
import User from "../../models/User.js";
import bcrypt from 'bcryptjs';
import DatabaseOperations from '../DatabaseOperations.js';

class UserService {
    constructor() {
        this.DatabaseOperation = new DatabaseOperations(User);
    }

    async createUser(email, password, username) {
        // Check if a user with the provided email or username already exists
        const existingEmail = await this.DatabaseOperation.findOne({ email });
        if (existingEmail) {
            throw new Error("User with this email already exists.");
        }

        const existingUsername = await this.DatabaseOperation.findOne({ username });
        if (existingUsername) {
            throw new Error("User with this username already exists.");
        }

        const salt = await bcrypt.genSalt(10);
        const securePassword = await bcrypt.hash(password, salt);

        // Create a new user instance
        return await this.DatabaseOperation.create({
            email,
            username,
            password: securePassword,
        });
    }

    async validateUser(email, password) {
        const user = await this.DatabaseOperation.findOne({ email });
        if (!user) {
            return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        return isValidPassword ? user : null;
    }
}

export default UserService;