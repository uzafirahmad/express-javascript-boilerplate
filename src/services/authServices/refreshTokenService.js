import RefreshToken from '../../models/RefreshToken.js'
import DatabaseOperations from '../DatabaseOperations.js';


class RefreshTokenService {
    constructor() {
        this.DatabaseOperation = new DatabaseOperations(RefreshToken);
    }

    async createRefreshToken(refreshTokenString, userId) {
        return await this.DatabaseOperation.create({
            refreshToken: refreshTokenString,
            user: userId,
        });
    }

    async validateRefreshToken(refreshToken) {
        const storedToken = await this.DatabaseOperation.findOne(
            { refreshToken },
            'user'  // populate the user field
        );

        if (!storedToken || storedToken.expires < new Date()) {
            return null;
        }

        return storedToken;
    }

    async deleteRefreshToken(refreshToken) {
        return await this.DatabaseOperation.deleteOne({ refreshToken });
    }
}

export default RefreshTokenService