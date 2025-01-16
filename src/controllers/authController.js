import UserService from '../services/authServices/userService.js';
import AccessTokenService from '../services/authServices/accessTokenService.js';
import RefreshTokenService from '../services/authServices/refreshTokenService.js';
import BlackListedTokenService from '../services/authServices/blackListedTokenService.js';
import { validatePassword } from '../utils/validators.js';

const userService = new UserService();
const accessTokenService = new AccessTokenService(process.env.JWT_SECRET);
const refreshTokenService = new RefreshTokenService();
const blackListedTokenService = new BlackListedTokenService();

const signupUser = async (req, res) => {
    try {
        const { email, password, confirmPassword, username } = req.body;

        // Validation checks
        if (!email || !password || !confirmPassword || !username) {
            return res.status(400).json({
                message: "Email, password, username, and confirm password are required."
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long, include at least 1 uppercase letter, and at least 1 special character."
            });
        }

        await userService.createUser(email, password, username);
        res.status(201).json({ message: "User created successfully" });

    } catch (err) {
        if (err.message.includes("already exists")) {
            return res.status(400).json({ message: err.message });
        }
        console.error(err);
        res.status(500).json({ message: "Error creating user" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Both email and password are required."
            });
        }

        const user = await userService.validateUser(email, password);
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const payload = accessTokenService.createTokenPayload(user);
        const accessToken = accessTokenService.generateAccessToken(payload);
        const refreshTokenString = accessTokenService.generateRefreshToken();

        await refreshTokenService.createRefreshToken(refreshTokenString, user.id);

        res.status(200).json({
            accessToken,
            refreshToken: refreshTokenString,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error logging in" });
    }
};

const verify = async (req, res) => {
    try {
        const { accessToken } = req.body;
        accessTokenService.verifyAccessToken(accessToken);
        res.status(200).json({ valid: true, message: "Token is valid" });
    } catch (error) {
        res.status(401).json({ valid: false, message: "Invalid or expired token" });
    }
};

const getToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is required." });
        }

        const isBlacklisted = await blackListedTokenService.isTokenBlacklisted(refreshToken);
        if (isBlacklisted) {
            return res.status(401).json({ message: "Invalid refresh token." });
        }

        const storedToken = await refreshTokenService.validateRefreshToken(refreshToken);
        if (!storedToken || !storedToken.user) {
            return res.status(401).json({ message: "Refresh token expired or invalid." });
        }

        const payload = accessTokenService.createTokenPayload(storedToken.user);
        const newAccessToken = accessTokenService.generateAccessToken(payload);
        const newRefreshTokenString = accessTokenService.generateRefreshToken();

        // Create new refresh token
        await refreshTokenService.createRefreshToken(newRefreshTokenString, storedToken.user._id);

        // Blacklist old refresh token
        await blackListedTokenService.blacklistToken(refreshToken);

        // Delete old refresh token
        await refreshTokenService.deleteRefreshToken(refreshToken);

        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshTokenString,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error." });
    }
};

export {
    loginUser,
    signupUser,
    getToken,
    verify,
};