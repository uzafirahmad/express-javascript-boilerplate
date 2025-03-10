import express from 'express';
import fetchUser from '../middleware/fetchUser.js';
import authController from '../controllers/auth.controller.js';
import validateDTO from '../utils/validateDTO.js';
import authDTO from '../dtos/auth.dto.js';

const router = express.Router();

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

export default router;