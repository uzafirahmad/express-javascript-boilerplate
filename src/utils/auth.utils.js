import jwt from 'jsonwebtoken'
import CustomError from './errors.js';
import { createSecretKey, createHash } from 'crypto';
import { CompactEncrypt, compactDecrypt } from 'jose';
import { TextEncoder } from 'util';

class AuthUtils {
  #secretKey
  #jwtSecret

  constructor() {
    this.#jwtSecret = process.env.JWT_SECRET;

    const keyBuffer = createHash('sha256').update(this.#jwtSecret).digest();

    this.#secretKey = createSecretKey(keyBuffer);
  }

  getHtmlTemplate(resetLink) {
    return `
        <html>
          <head>
            <style>
              /* General body styles */
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                padding: 20px;
                margin: 0;
                color: #333;
              }
              /* Container for the email content */
              .container {
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                max-width: 600px;
                margin: 0 auto;
              }
              /* Header section */
              .header {
                text-align: center;
                color: #4CAF50;
                margin-bottom: 20px;
              }
              /* Content section */
              .content {
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 20px;
              }
              /* Reset password button */
              .btn {
                display: block;
                width: 200px;
                margin: 20px auto;
                padding: 12px;
                text-align: center;
                background-color: #4CAF50;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
              }
              /* Footer section */
              .footer {
                text-align: center;
                font-size: 12px;
                color: #888888;
                margin-top: 20px;
              }
              /* Make the email responsive for mobile */
              @media only screen and (max-width: 600px) {
                .container {
                  width: 100%;
                  padding: 15px;
                }
                .btn {
                  width: 100%;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <!-- Header with the title of the email -->
              <div class="header">
                <h2>Password Reset Request</h2>
              </div>
              
              <!-- Main content of the email -->
              <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset your password. If you made this request, please click the button below to reset your password. If you didn't request this change, you can ignore this email.</p>
                <a href="${resetLink}" class="btn">Reset Password</a>
              </div>
              
              <!-- Additional information -->
              <div class="content">
                <p>If you have any questions or did not request a password reset, please contact our support team.</p>
              </div>
        
              <!-- Footer with company information -->
              <div class="footer">
                <p>Thank you for using our service!</p>
                <p>&copy; ${new Date().getFullYear()} Example. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
        `;
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessTokenSecret);
    } catch (error) {
      throw new CustomError("Invalid access token", 401);
    }
  }

  generateAccessToken(payload) {
    return jwt.sign(
      { ...payload, tokenType: 'access' },
      this.#jwtSecret,
      { expiresIn: "5m" }
    );
  }

  async generateRefreshToken(payload) {
    const tokenPayload = {
      ...payload,
      tokenType: 'refresh',
      // Set expiration to 7 days (adjust as needed)
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
    };


    const encoder = new TextEncoder();
    const jwe = await new CompactEncrypt(
      encoder.encode(JSON.stringify(tokenPayload))
    )
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .encrypt(this.#secretKey);

    return jwe;
  }

  async decryptRefreshToken(token) {
    try {
      const { plaintext } = await compactDecrypt(token, this.#secretKey);
      const payload = JSON.parse(new TextDecoder().decode(plaintext));
      return payload;
    } catch (error) {
      throw new CustomError("Failed to decrypt refresh token", 401);
    }
  }

  createPayload(user, forAccessToken = true) {
    const basePayload = {
      id: user.id ? user.id : user.id,
      token_version: user.token_version
    };

    if (forAccessToken) {
      basePayload.email = user.email;
      basePayload.username = user.username;
    }

    return basePayload;
  }
}

const authUtils = new AuthUtils()
export default authUtils;