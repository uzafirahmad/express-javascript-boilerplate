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

    async logout(req, res) {
        try {
            const { refreshToken } = req.data;

            await authService.logout(refreshToken);

            res.status(200).json({
                message: "logged out",
            });

        } catch (err) {
            const status = err.statusCode || 500;
            const message = err.statusCode ? err.message : "Internal server error";
            res.status(status).json({ message });
        }
    }

    async updateAccountInfo(req, res) {
        try {
            const user = req.user
            const { username } = req.data;

            const data = await authService.updateAccountInfo(username, user);

            res.status(200).json({
                message: data.message,
                success: data.success,
                accessToken: data.accessToken
            });
        } catch (err) {
            const status = err.statusCode || 500;
            const message = err.statusCode ? err.message : "Internal server error";
            res.status(status).json({ message });
        }
    }

    async updatePassword(req, res) {
        try {
            const user = req.user
            const { current_password, new_password } = req.data;

            const data = await authService.updatePassword(user, current_password, new_password);

            res.status(200).json({
                message: data.message,
                success: data.success,
            });
        } catch (err) {
            const status = err.statusCode || 500;
            const message = err.statusCode ? err.message : "Internal server error";
            res.status(status).json({ message });
        }
    }

    async delete(req, res) {
        try {
            const user = req.user

            const deleted = await authService.delete(user);

            res.status(200).json({
                message: "User deleted successfully",
                deleted,
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