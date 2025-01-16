import jwt from 'jsonwebtoken'
import randomString from 'randomstring'

class AccessTokenService {
    constructor(jwtSecret) {
        this.jwtSecret = jwtSecret;
    }

    generateAccessToken(payload) {
        return jwt.sign(payload, this.jwtSecret, { expiresIn: "1440m" });
    }

    generateRefreshToken() {
        return randomString.generate(192);
    }

    verifyAccessToken(token) {
        return jwt.verify(token, this.jwtSecret);
    }

    createTokenPayload(user) {
        return {
            id: user.id,
            email: user.email,
            username: user.username
        };
    }
}

export default AccessTokenService