import express from 'express';
import fetchUser from '../middleware/fetchUser.js';
import authController from '../controllers/auth.controller.js';
import { validateDTO } from '../utils/validators.js';
import authDTO from '../dtos/auth.dto.js';

const router = express.Router();

router.post(
    "/register",
    validateDTO(authDTO.getRegisterValidation()),
    (req, res) => authController.register(req, res)
);

router.post(
    "/login",
    validateDTO(authDTO.getLoginValidation()),
    (req, res) => authController.login(req, res)
);

router.post(
    "/refresh",
    validateDTO(authDTO.getRefreshTokenValidation()),
    (req, res) => authController.refresh(req, res)
);

export default router;