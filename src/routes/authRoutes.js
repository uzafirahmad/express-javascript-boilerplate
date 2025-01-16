import express from "express";
import fetchUser from "../middleware/fetchUser.js";
import AuthController from '../controllers/authController.js';

const router = express.Router();
const authController = new AuthController();

router.post("/register", (req, res) => {
    authController.signupUser(req, res);
});

router.post("/login", (req, res) => {
    authController.loginUser(req, res);
});

router.post("/verify", (req, res) => {
    authController.verify(req, res);
});

router.post("/refresh", (req, res) => {
    authController.getToken(req, res);
});

export default router;