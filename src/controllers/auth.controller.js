import authService from '../services/auth.service.js';
import googleAuthService from '../services/google.auth.service.js';

class AuthController {
    async googleCallback(req, res) {
        try {
            const { accessToken, refreshToken } = await googleAuthService.googleAuthCallback(req.user);

            // Redirect to frontend with tokens
            res.redirect(`${process.env.FRONTEND_URL}/oauth/google?` +
                `accessToken=${accessToken}&` +
                `refreshToken=${refreshToken}`);
        } catch (err) {
            console.error('Google auth callback error:', err);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
        }
    }

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

            const { accessToken, refreshToken, verified } = await authService.login(email, password);

            res.status(200).json({
                accessToken,
                refreshToken,
                verified
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

    async checkEmail(req, res) {
        try {
            const { email } = req.data;

            await authService.checkEmail(email);

            res.status(200).json({ status: true });
        } catch (err) {
            const status = err.statusCode || 500;
            const message = err.statusCode ? err.message : "Internal server error";
            res.status(status).json({ message });
        }
    }

    async checkUsername(req, res) {
        try {
            const { username } = req.data;

            await authService.checkUsername(username);

            res.status(200).json({ status: true });
        } catch (err) {
            const status = err.statusCode || 500;
            const message = err.statusCode ? err.message : "Internal server error";
            res.status(status).json({ message });
        }
    }

    async checkPassword(req, res) {
        try {
            res.status(200).json({ status: true });
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
                message: "Account info updated successfully",
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

            await authService.updatePassword(user, current_password, new_password);

            res.status(200).json({
                message: "Password updated successfully",
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

            await authService.delete(user);

            res.status(200).json({
                message: "User deleted successfully",
            });
        } catch (err) {
            const status = err.statusCode || 500;
            const message = err.statusCode ? err.message : "Internal server error";
            res.status(status).json({ message });
        }
    }

    async resetPasswordEmail(req, res) {
        try {
            const { email } = req.data;

            await authService.resetPasswordEmail(email);

            res.status(200).json({
                message: "Password reset email sent",
            });
        } catch (err) {
            const status = err.statusCode || 500;
            const message = err.statusCode ? err.message : "Internal server error";
            res.status(status).json({ message });
        }
    }

    async resetPasswordSubmit(req, res) {
        try {
            const { password, token } = req.data;

            await authService.resetPasswordSubmit(password, token);

            res.status(200).json({
                message: "Password reset successful",
            });
        } catch (err) {
            const status = err.statusCode || 500;
            const message = err.statusCode ? err.message : "Internal server error";
            res.status(status).json({ message });
        }
    }


















    async verifyAccountEmail(req, res) {
        try {
            const { email } = req.data;

            await authService.verifyAccountEmail(email);

            res.status(200).json({
                message: "Account verification email sent",
            });
        } catch (err) {
            const status = err.statusCode || 500;
            const message = err.statusCode ? err.message : "Internal server error";
            res.status(status).json({ message });
        }
    }

    async verifyAccountSubmit(req, res) {
        try {
            const { token } = req.data;

            const { accessToken, refreshToken } = await authService.verifyAccountSubmit(token);

            res.status(200).json({
                accessToken,
                refreshToken
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