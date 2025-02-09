import { body } from 'express-validator';

class AuthDTO {
    getRegisterValidation() {
        return [
            body('email')
                .isEmail()
                .withMessage('Please provide a valid email')
                .normalizeEmail(),
            body('password')
                .isLength({ min: 8 })
                .withMessage('Password must be at least 8 characters long')
                .matches(/\d/)
                .withMessage('Password must contain at least one number')
                .matches(/[A-Z]/)
                .withMessage('Password must contain at least one uppercase letter'),
            body('username')
                .isLength({ min: 3 })
                .withMessage('Username must be at least 3 characters long')
                .trim()
                .escape()
        ];
    }

    getLoginValidation() {
        return [
            body('email')
                .isEmail()
                .withMessage('Please provide a valid email')
                .normalizeEmail(),
            body('password')
                .notEmpty()
                .withMessage('Password is required')
        ];
    }

    getRefreshTokenValidation() {
        return [
            body('refreshToken')
                .notEmpty()
                .withMessage('Refresh token is required')
        ];
    }
}

const authDTO = new AuthDTO();
export default authDTO;