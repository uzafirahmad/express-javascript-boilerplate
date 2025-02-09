class AuthUtils {
    constructor() {

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