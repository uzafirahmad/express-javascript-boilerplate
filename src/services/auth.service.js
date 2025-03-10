import bcrypt from 'bcryptjs';
import DatabaseRepository from '../repository/database.repository.js';
import jwt from 'jsonwebtoken'
import randomString from 'randomstring'
import { User, BlacklistedToken } from '../models/auth.models.js'
import CustomError from '../utils/errors.js'
import authUtils from '../utils/auth.utils.js';
import crypto from "crypto";


class AuthService {
    #userRepository;
    #blacklistedTokenRepository;

    constructor() {
        this.#userRepository = new DatabaseRepository(User);
        this.#blacklistedTokenRepository = new DatabaseRepository(BlacklistedToken);
    }

    async register(email, password, username) {
        try {
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
        } catch (error) {
            throw new CustomError(error.message, error.statusCode);
        }
    }

    async login(email, password) {
        try {
            const user = await this.#userRepository.findOne({ email });
            if (!user) {
                throw new CustomError("Error logging in", 401);
            }

            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                throw new CustomError("Error logging in", 401);
            }

            const access_payload = authUtils.createPayload(user, true)
            const refresh_payload = authUtils.createPayload(user, false)

            const accessToken = authUtils.generateAccessToken(access_payload);
            const refreshToken = await authUtils.generateRefreshToken(refresh_payload);

            return {
                accessToken,
                refreshToken
            }
        } catch (error) {
            throw new CustomError(error.message, error.statusCode);
        }
    }

    async refresh(refreshToken) {
        try {
            const isBlacklisted = await this.#blacklistedTokenRepository.findOne({ token: refreshToken });
            if (isBlacklisted) {
                throw new CustomError("Token has been invalidated", 401);
            }

            const decoded = await authUtils.decryptRefreshToken(refreshToken);

            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp < currentTime) {
                throw new CustomError("Refresh token has expired", 401);
            }

            if (decoded.tokenType !== 'refresh') {
                throw new CustomError("Invalid token type", 401);
            }

            const user = await this.#userRepository.findOne({ _id: decoded.id });

            if (!user) {
                throw new CustomError("User not found", 404);
            }

            if (decoded.tokenVersion !== user.tokenVersion) {
                throw new CustomError("Token has been invalidated due to password change", 401);
            }

            const access_payload = authUtils.createPayload(user, true)
            const refresh_payload = authUtils.createPayload(user, false)

            const accessTokenNew = authUtils.generateAccessToken(access_payload);
            const refreshTokenNew = await authUtils.generateRefreshToken(refresh_payload);

            await this.#blacklistedTokenRepository.create({ token: refreshToken });

            return { accessTokenNew, refreshTokenNew };
        } catch (error) {
            throw new CustomError(error.message, error.statusCode);
        }
    }

    async logout(refreshToken) {
        try {
            const isBlacklisted = await this.#blacklistedTokenRepository.findOne({ token: refreshToken });
            if (isBlacklisted) {
                throw new CustomError("Token has been invalidated", 401);
            }

            const decoded = await authUtils.decryptRefreshToken(refreshToken);

            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp < currentTime) {
                throw new CustomError("Refresh token has expired", 401);
            }

            if (decoded.tokenType !== 'refresh') {
                throw new CustomError("Invalid token type", 401);
            }

            await this.#blacklistedTokenRepository.create({ token: refreshToken });
        } catch (error) {
            throw new CustomError(error.message, error.statusCode);
        }
    }


    async updateAccountInfo(username, user) {
        try {
            const userData = await this.#userRepository.findOne({ _id: user.id });

            if (!userData) {
                throw new CustomError("User not found.", 404);
            }

            const existingUser = await this.#userRepository.findOne({
                username: username,
                _id: { $ne: user.id } // Exclude current user from check
            });

            if (existingUser) {
                throw new CustomError("Username is already taken.", 400);
            }

            const updatedUser = await this.#userRepository.updateOne(
                { _id: user.id },
                {
                    username: username,
                }
            );

            if (!updatedUser) {
                throw new CustomError("Failed to update account information.", 500);
            }

            const updatedUserData = await this.#userRepository.findOne({ _id: user.id });

            const payload = authUtils.createPayload(updatedUserData, true);

            const accessToken = authUtils.generateAccessToken(payload);

            return {
                success: true,
                accessToken: accessToken,
                message: "Account information updated successfully"
            };
        } catch (error) {
            throw new CustomError(error.message, error.statusCode);
        }
    }

    async delete(user) {
        try {
            const dbuser = await this.#userRepository.deleteOne({ email: user.email });
            return dbuser.acknowledged
        } catch (error) {
            throw new CustomError(error.message, error.statusCode);
        }
    }

    async updatePassword(user, current_password, new_password) {
        try {
            const userData = await this.#userRepository.findOne({ _id: user.id });

            if (!userData) {
                throw new CustomError("User not found.", 404);
            }

            const isPasswordCorrect = await bcrypt.compare(current_password, userData.password);

            if (!isPasswordCorrect) {
                throw new CustomError("Current password is incorrect.", 401);
            }

            const isSamePassword = await bcrypt.compare(new_password, userData.password);

            if (isSamePassword) {
                throw new CustomError("New password cannot be the same as current password.", 400);
            }

            const salt = await bcrypt.genSalt(10);
            const securePassword = await bcrypt.hash(new_password, salt);

            const newTokenVersion = crypto.randomBytes(16).toString('hex');

            const updatedUser = await this.#userRepository.updateOne(
                { _id: user.id },
                {
                    tokenVersion: newTokenVersion,
                    password: securePassword,
                }
            );

            if (!updatedUser) {
                throw new CustomError("Failed to update password.", 500);
            }

            return {
                success: true,
                message: "Password updated successfully"
            };
        } catch (error) {
            throw new CustomError(error.message, error.statusCode);
        }
    }
}

const authService = new AuthService()
export default authService;