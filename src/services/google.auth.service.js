import bcrypt from 'bcryptjs';
import MongoRepository from '../repository/mongoose.repository.js';
import CustomError from '../utils/errors.js'
import authUtils from '../utils/auth.utils.js';
import crypto from "crypto";
import nodemailer from 'nodemailer';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import PrismaRepository from '../repository/prisma.repository.js';


class GoogleAuthService {
    #userRepository;
    #oauthAccountRepository;

    constructor() {
        this.#userRepository = new PrismaRepository('User');
        this.#oauthAccountRepository = new PrismaRepository('OAuthAccount');
        this.initializeGoogleStrategy();
    }

    initializeGoogleStrategy() {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8000/auth/google/callback',
                    scope: ['profile', 'email']
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        // Find OAuth account by provider ID
                        let oauthAccount = await this.#oauthAccountRepository.findOne({
                            provider: 'google',
                            provider_id: profile.id
                        });

                        // If OAuth account doesn't exist, check by email
                        if (!oauthAccount) {
                            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

                            if (!email) {
                                return done(new CustomError('No email found from Google profile', 400));
                            }

                            // Find user by email
                            let user = await this.#userRepository.findOne({ email });

                            // If user exists, create OAuth account
                            if (user) {
                                oauthAccount = await this.#oauthAccountRepository.create({
                                    provider: 'google',
                                    provider_id: profile.id,
                                    user_id: user.id
                                });
                            } else {
                                // Create new user and OAuth account
                                const username = profile.displayName.replace(/\s+/g, '').toLowerCase() +
                                    crypto.randomBytes(2).toString('hex');

                                const password = crypto.randomBytes(16).toString('hex')
                                const salt = await bcrypt.genSalt(10);
                                const securePassword = await bcrypt.hash(password, salt);

                                // Create user first
                                user = await this.#userRepository.create({
                                    email,
                                    username,
                                    account_type: "google",
                                    password: securePassword
                                });

                                // Then create associated OAuth account
                                oauthAccount = await this.#oauthAccountRepository.create({
                                    provider: 'google',
                                    provider_id: profile.id,
                                    user_id: user.id
                                });
                            }
                        }

                        // Fetch the full user details
                        const user = await this.#userRepository.findById(oauthAccount.user_id);

                        return done(null, user);
                    } catch (error) {
                        return done(error);
                    }
                }
            )
        );
    }

    async googleAuthCallback(user) {
        try {
            if (!user) {
                throw new CustomError("Authentication failed", 401);
            }

            const access_payload = authUtils.createPayload(user, true);
            const refresh_payload = authUtils.createPayload(user, false);

            const accessToken = authUtils.generateAccessToken(access_payload);
            const refreshToken = await authUtils.generateRefreshToken(refresh_payload);

            return {
                accessToken,
                refreshToken
            };
        } catch (error) {
            throw new CustomError(error.message, error.statusCode || 500);
        }
    }
}

const googleAuthService = new GoogleAuthService()
export default googleAuthService;