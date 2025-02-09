import bcrypt from 'bcryptjs';
import MongooseDatabaseOperations from '../repository/mongoose.repository.js';
import jwt from 'jsonwebtoken'
import randomString from 'randomstring'
import { User, BlacklistedToken, RefreshToken } from '../models/auth.models.js'
import CustomError from '../utils/errors.js'
import authUtils from '../utils/auth.utils.js';


class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET;
        this.userRepository = new MongooseDatabaseOperations(User);
        this.refreshTokenRepository = new MongooseDatabaseOperations(RefreshToken);
        this.blacklistedTokenRepository = new MongooseDatabaseOperations(BlacklistedToken);
    }

    async register(email, password, username) {
        const existingEmail = await this.userRepository.findOne({ email });

        if (existingEmail) {
            throw new CustomError("User with this email already exists.", 409);
        }

        const existingUsername = await this.userRepository.findOne({ username });
        if (existingUsername) {
            throw new CustomError("User with this username already exists.", 409);
        }

        const salt = await bcrypt.genSalt(10);
        const securePassword = await bcrypt.hash(password, salt);

        return await this.userRepository.create({
            email,
            username,
            password: securePassword,
        });
    }

    async login(email, password) {
        const user = await this.userRepository.findOne({ email });
        if (!user) {
            throw new CustomError("Error logging in", 401);
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            throw new CustomError("Error logging in", 401);
        }

        const payload = authUtils.createPayload(user)

        const accessToken = jwt.sign(payload, this.jwtSecret, { expiresIn: "5m" });
        const refreshToken = randomString.generate(10);

        this.refreshTokenRepository.create({
            refreshToken: refreshToken,
            user: user.id,
        });

        return {
            accessToken,
            refreshToken
        }
    }

    async refresh(refreshToken) {
        const isBlacklisted = await this.blacklistedTokenRepository.findOne({ token: refreshToken });

        if (isBlacklisted) {
            throw new CustomError("Invalid refresh token", 401);
        }

        const storedToken = await this.refreshTokenRepository.findOne(
            { refreshToken },
            'user'  // populate the user field
        );

        if (!storedToken || storedToken.expires < new Date() || !storedToken.user) {
            throw new CustomError("Invalid refresh token", 401);
        }

        const payload = authUtils.createPayload(storedToken.user)

        const accessTokenNew = jwt.sign(payload, this.jwtSecret, { expiresIn: "5m" });
        const refreshTokenNew = randomString.generate(10);

        this.refreshTokenRepository.create({
            refreshToken: refreshTokenNew,
            user: storedToken.user._id,
        });

        this.blacklistedTokenRepository.create({ token: refreshToken });

        return {
            accessTokenNew,
            refreshTokenNew
        }
    }
}

const authService = new AuthService()
export default authService;