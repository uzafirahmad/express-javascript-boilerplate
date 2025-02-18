import authService from '../services/auth.service.js';

class AuthController {
    async register(req, res) {
        try {
            const { email, password, username } = req.data;

            const user = await authService.register(email, password, username);

            res.status(201).json({ message: "User created successfully", user });

        } catch (err) {
            const status = err.statusCode || 500;
            const message = err.statusCode ? err.message : "Internal server error";
            res.status(status).json({ message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.data;

            const { accessToken, refreshToken } = await authService.login(email, password);

            res.status(200).json({
                accessToken,
                refreshToken,
            });

        } catch (err) {
            const status = err.statusCode || 500;
            const message = err.statusCode ? err.message : "Internal server error";
            res.status(status).json({ message });
        }
    }

    async refresh(req, res) {
        try {
            const { refreshToken } = req.data;

            const { accessTokenNew, refreshTokenNew } = await authService.refresh(refreshToken);

            res.status(200).json({
                accessToken: accessTokenNew,
                refreshToken: refreshTokenNew,
            });

        } catch (err) {
            const status = err.statusCode || 500;
            const message = err.statusCode ? err.message : "Internal server error";
            res.status(status).json({ message });
        }
    }
}

const authController = new AuthController()
export default authController;