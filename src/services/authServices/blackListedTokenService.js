import BlacklistedToken from '../../models/BlacklistedToken.js'
import DatabaseOperations from '../DatabaseOperations.js';


class BlackListedTokenService {
    constructor() {
        this.DatabaseOperation = new DatabaseOperations(BlacklistedToken);
    }

    async blacklistToken(token) {
        return await this.DatabaseOperation.create({ token });
    }

    async isTokenBlacklisted(token) {
        return await this.DatabaseOperation.findOne({ token });
    }
}

export default BlackListedTokenService