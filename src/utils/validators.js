const validatePassword = (password) => {
    const validated = false

    if (!password || password.length < 6) {
        return false
    }

    if (!/[A-Z]/.test(password)) {
        return false
    }

    if (!/[!@#$&*]/.test(password)) {
        return false
    }

    return true
};

export {
    validatePassword
}