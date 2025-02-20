import bcrypt from 'bcryptjs';
import DatabaseRepository from '../repository/database.repository.js';
import jwt from 'jsonwebtoken'
import randomString from 'randomstring'
import { User, BlacklistedToken, RefreshToken } from '../models/auth.models.js'
import CustomError from '../utils/errors.js'
import authUtils from '../utils/auth.utils.js';


class AuthService {
    #userRepository;
    #blacklistedTokenRepository;

    constructor() {
        this.#userRepository = new DatabaseRepository(User);
        this.#blacklistedTokenRepository = new DatabaseRepository(BlacklistedToken);
    }

    async register(email, password, username) {
        const existingEmail = await this.#userRepository.findOne({ email });

        if (existingEmail) {
            throw new CustomError("User with this email already exists.", 409);
        }

        const existingUsername = await this.#userRepository.findOne({ username });
        if (existingUsername) {
            throw new CustomError("User with this username already exists.", 409);
        }

        const salt = await bcrypt.genSalt(10);
        const securePassword = await bcrypt.hash(password, salt);

        return await this.#userRepository.create({
            email,
            username,
            password: securePassword,
        });
    }

    async login(email, password) {
        const user = await this.#userRepository.findOne({ email });
        if (!user) {
            throw new CustomError("Error logging in", 401);
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            throw new CustomError("Error logging in", 401);
        }

        const payload = authUtils.createPayload(user)

        const accessToken = authUtils.generateAccessToken(payload);
        const refreshToken = await authUtils.generateRefreshToken(payload);

        return {
            accessToken,
            refreshToken
        }
    }

    async refresh(refreshToken) {
        try {
            // Check if the token is blacklisted
            const isBlacklisted = await this.#blacklistedTokenRepository.findOne({ token: refreshToken });
            if (isBlacklisted) {
                throw new CustomError("Token has been invalidated", 401);
            }

            // Decrypt the refresh token to get the payload
            const decoded = await authUtils.decryptRefreshToken(refreshToken);

            // Check if the refresh token has expired
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp < currentTime) {
                throw new CustomError("Refresh token has expired", 401);
            }

            // Verify it's actually a refresh token
            if (decoded.tokenType !== 'refresh') {
                throw new CustomError("Invalid token type", 401);
            }

            const item = authUtils.createPayload(decoded)

            // Generate new tokens
            const accessTokenNew = authUtils.generateAccessToken(item);
            const refreshTokenNew = await authUtils.generateRefreshToken(item);

            // Blacklist the used refresh token so it cannot be reused
            await this.#blacklistedTokenRepository.create({ token: refreshToken });

            return { accessTokenNew, refreshTokenNew };
        } catch (error) {
            throw new CustomError("Invalid refresh token", 401);
        }
    }

    async logout(refreshToken) {
        await this.#blacklistedTokenRepository.create({ token: refreshToken });
    }
}

const authService = new AuthService()
export default authService;