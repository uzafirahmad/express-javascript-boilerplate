import { body } from 'express-validator';

class AuthDTO {
    register() {
        return [
            body('email')
                .notEmpty()
                .withMessage('email is required')
                .isEmail()
                .withMessage('Please provide a valid email')
                .normalizeEmail(),
            body('password')
                .notEmpty()
                .withMessage('password is required')
                .isLength({ min: 8 })
                .withMessage('Password must be at least 8 characters long')
                .matches(/\d/)
                .withMessage('Password must contain at least one number')
                .matches(/[A-Z]/)
                .withMessage('Password must contain at least one uppercase letter'),
            body('username')
                .notEmpty()
                .withMessage('username is required')
                .isLength({ min: 3 })
                .withMessage('Username must be at least 3 characters long')
                .trim()
                .escape()
        ];
    }

    login() {
        return [
            body('email')
                .notEmpty()
                .withMessage('email is required')
                .isEmail()
                .withMessage('Please provide a valid email'),
            body('password')
                .notEmpty()
                .withMessage('password is required')
        ];
    }

    refresh() {
        return [
            body('refreshToken')
                .notEmpty()
                .withMessage('refreshToken is required')
        ];
    }

    updateAccountInfo() {
        return [
            body('username')
                .notEmpty()
                .withMessage('username is required')
                .isLength({ max: 20 })
                .withMessage('Username must be at most 20 characters long')
                .trim()
        ];
    }

    updatePassword() {
        return [
            body('current_password')
                .notEmpty()
                .withMessage('current_password is required'),
            body('new_password')
                .notEmpty()
                .withMessage('new_password is required')
                .isLength({ min: 8 })
                .withMessage('Password must be at least 8 characters long')
                .matches(/\d/)
                .withMessage('Password must contain at least one number')
                .matches(/[A-Z]/)
                .withMessage('Password must contain at least one uppercase letter'),
        ];
    }

    logout() {
        return [
            body('refreshToken')
                .notEmpty()
                .withMessage('refreshToken is required')
        ];
    }

}

const authDTO = new AuthDTO();
export default authDTO;