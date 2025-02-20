import jwt from 'jsonwebtoken'
import CustomError from './errors.js';
import { createSecretKey, createHash } from 'crypto';
import { CompactEncrypt, compactDecrypt } from 'jose';
import { TextEncoder } from 'util';

class AuthUtils {
    #secretKey
    #jwtSecret

    constructor() {
        this.#jwtSecret = process.env.JWT_SECRET;

        const keyBuffer = createHash('sha256').update(this.#jwtSecret).digest();

        this.#secretKey = createSecretKey(keyBuffer);
    }

    verifyAccessToken(token) {
        try {
            return jwt.verify(token, this.accessTokenSecret);
        } catch (error) {
            throw new CustomError("Invalid access token", 401);
        }
    }

    generateAccessToken(payload) {
        return jwt.sign(
            { ...payload, tokenType: 'access' },
            this.#jwtSecret,
            { expiresIn: "5m" }
        );
    }

    async generateRefreshToken(payload) {
        const tokenPayload = {
            ...payload,
            tokenType: 'refresh',
            // Set expiration to 7 days (adjust as needed)
            exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
        };


        const encoder = new TextEncoder();
        const jwe = await new CompactEncrypt(
            encoder.encode(JSON.stringify(tokenPayload))
        )
            .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
            .encrypt(this.#secretKey);

        return jwe;
    }

    async decryptRefreshToken(token) {
        try {
            const { plaintext } = await compactDecrypt(token, this.#secretKey);
            const payload = JSON.parse(new TextDecoder().decode(plaintext));
            return payload;
        } catch (error) {
            throw new CustomError("Failed to decrypt refresh token", 401);
        }
    }

    createPayload(user) {
        return {
            id: user.id ? user.id : user._id,
            email: user.email,
            username: user.username
        }
    }
}

const authUtils = new AuthUtils()
export default authUtils;