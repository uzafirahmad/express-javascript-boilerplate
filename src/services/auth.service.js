import bcrypt from 'bcryptjs';
import MongoRepository from '../repository/mongoose.repository.js';
import CustomError from '../utils/errors.js'
import authUtils from '../utils/auth.utils.js';
import crypto from "crypto";
import nodemailer from 'nodemailer';
import PrismaRepository from '../repository/prisma.repository.js';
import emailService from './email.service.js';


class AuthService {
    #userRepository;
    #blacklistedTokenRepository;

    constructor() {
        this.#userRepository = new PrismaRepository('User');
        this.#blacklistedTokenRepository = new PrismaRepository('BlacklistedToken');
    }

    async register(email, password, username) {
        try {
            this.checkEmail(email)

            this.checkUsername(username)

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
                throw new CustomError("Please enter a valid email and password", 401);
            }

            if (user.verified === false) {
                return {
                    accessToken: "",
                    refreshToken: "",
                    verified: false
                }
            }

            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                throw new CustomError("Please enter a valid email and password", 401);
            }

            const access_payload = authUtils.createPayload(user, true)
            const refresh_payload = authUtils.createPayload(user, false)

            const accessToken = authUtils.generateAccessToken(access_payload);
            const refreshToken = await authUtils.generateRefreshToken(refresh_payload);

            return {
                accessToken,
                refreshToken,
                verified: true
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

            const user = await this.#userRepository.findOne({ id: decoded.id });

            if (!user) {
                throw new CustomError("User not found", 404);
            }

            if (decoded.token_version !== user.token_version) {
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

    async checkEmail(email) {
        try {
            const existingEmail = await this.#userRepository.findOne({ email });

            if (existingEmail) {
                throw new CustomError("User with this email already exists.", 409);
            }
        } catch (error) {
            throw new CustomError(error.message, error.statusCode);
        }
    }

    async checkUsername(username) {
        try {
            const existingUsername = await this.#userRepository.findOne({ username });

            if (existingUsername) {
                throw new CustomError("User with this username already exists.", 409);
            }
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
            const userData = await this.#userRepository.findOne({ id: user.id });

            if (!userData) {
                throw new CustomError("User not found.", 404);
            }

            const existingUser = await this.#userRepository.findOne({
                username: username,
                id: { $ne: user.id } // Exclude current user from check
            });

            if (existingUser) {
                throw new CustomError("Username is already taken.", 400);
            }

            const updatedUser = await this.#userRepository.updateOne(
                { id: user.id },
                {
                    username: username,
                }
            );

            if (!updatedUser) {
                throw new CustomError("Failed to update account information.", 500);
            }

            const updatedUserData = await this.#userRepository.findOne({ id: user.id });

            const payload = authUtils.createPayload(updatedUserData, true);

            const accessToken = authUtils.generateAccessToken(payload);

            return {
                accessToken: accessToken,
            };
        } catch (error) {
            throw new CustomError(error.message, error.statusCode);
        }
    }

    async delete(user) {
        try {
            await this.#userRepository.deleteOne({ email: user.email });
        } catch (error) {
            throw new CustomError(error.message, error.statusCode);
        }
    }

    async updatePassword(user, current_password, new_password) {
        try {
            const userData = await this.#userRepository.findOne({ id: user.id });

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
                { id: user.id },
                {
                    password_reset_token: '',
                    token_version: newTokenVersion,
                    password: securePassword,
                }
            );

            if (!updatedUser) {
                throw new CustomError("Failed to update password.", 500);
            }
        } catch (error) {
            throw new CustomError(error.message, error.statusCode);
        }
    }

    async resetPasswordSubmit(password, token) {
        try {
            // Find the user with this reset token
            const user = await this.#userRepository.findOne({ password_reset_token: token });

            if (!user) {
                throw new CustomError('Invalid or expired reset token', 400);
            }

            const salt = await bcrypt.genSalt(10);
            const securePassword = await bcrypt.hash(password, salt);

            const newTokenVersion = crypto.randomBytes(16).toString('hex');

            await this.#userRepository.updateOne(
                { password_reset_token: token },
                {
                    token_version: newTokenVersion,
                    password: securePassword,
                    password_reset_token: '',
                }
            );
        } catch (error) {
            throw new CustomError(error.message, error.statusCode || 500);
        }
    }

    async resetPasswordEmail(email) {
        try {
            const user = await this.#userRepository.findOne({ email });

            if (!user) {
                throw new CustomError('User not found', 404);
            }

            if (user.account_type !== 'normal') {
                throw new CustomError(`You signed up using ${user.account_type}. Please log in with ${user.account_type}`, 400);
            }

            const resetToken = crypto.randomBytes(32).toString('hex');

            this.#userRepository.updateOne(
                { email: email },
                { password_reset_token: resetToken }
            );

            const htmlTemplate = authUtils.getHtmlTemplate(`${process.env.FRONTEND_URL}/reset-password/${resetToken}`)

            await emailService.send({
                to: email,
                subject: 'Password Reset Request',
                html: htmlTemplate
            });

            setTimeout(async () => {
                try {
                    const userToUpdate = await this.#userRepository.findOne({ email });
                    if (userToUpdate && userToUpdate.password_reset_token === resetToken) {
                        this.#userRepository.updateOne(
                            { email: email },
                            { password_reset_token: '' }
                        );
                    }
                } catch (err) {
                    console.error('Error clearing reset token:', err);
                }
            }, 5 * 60 * 1000); // 5 minutes
        } catch (error) {
            throw new CustomError(error.message, error.statusCode);
        }
    }

}

const authService = new AuthService()
export default authService;