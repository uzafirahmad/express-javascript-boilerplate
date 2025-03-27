import express from 'express';
import fetchUser from '../middleware/fetchUser.js';
import authController from '../controllers/auth.controller.js';
import validateDTO from '../utils/validateDTO.js';
import authDTO from '../dtos/auth.dto.js';
import passport from 'passport';

const router = express.Router();

router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
    }),
    (req, res) => authController.googleCallback(req, res)
);

router.post(
    "/register",
    validateDTO(authDTO.register()),
    (req, res) => authController.register(req, res)
);

router.post(
    "/login",
    validateDTO(authDTO.login()),
    (req, res) => authController.login(req, res)
);

router.post(
    "/check-email",
    validateDTO(authDTO.checkEmail()),
    (req, res) => authController.checkEmail(req, res)
);

router.post(
    "/check-username",
    validateDTO(authDTO.checkUsername()),
    (req, res) => authController.checkUsername(req, res)
);

router.post(
    "/check-password",
    validateDTO(authDTO.checkPassword()),
    (req, res) => authController.checkPassword(req, res)
);

router.post(
    "/refresh",
    validateDTO(authDTO.refresh()),
    (req, res) => authController.refresh(req, res)
);

router.post(
    "/logout",
    validateDTO(authDTO.logout()),
    (req, res) => authController.logout(req, res)
);

router.delete(
    "/delete",
    fetchUser,
    (req, res) => authController.delete(req, res)
);

router.put(
    "/update-password",
    fetchUser,
    validateDTO(authDTO.updatePassword()),
    (req, res) => authController.updatePassword(req, res)
);

router.put(
    "/update-account-info",
    fetchUser,
    validateDTO(authDTO.updateAccountInfo()),
    (req, res) => authController.updateAccountInfo(req, res)
);

router.post(
    "/reset-password-email",
    validateDTO(authDTO.resetPasswordEmail()),
    (req, res) => authController.resetPasswordEmail(req, res)
);

router.put(
    "/reset-password-submit",
    validateDTO(authDTO.resetPasswordSubmit()),
    (req, res) => authController.resetPasswordSubmit(req, res)
);

export default router;