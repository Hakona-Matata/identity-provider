const jwt = require("jsonwebtoken");
const ORIGIN = require("../constants/origin");
const PERMISSION = require("./../constants/permission");

class TokenHelper {
	static async generateVerificationToken(payload) {
		return await TokenHelper.#generateToken(
			payload,
			process.env.VERIFICATION_TOKEN_SECRET,
			process.env.VERIFICATION_TOKEN_EXPIRES_IN
		);
	}

	static async verifyVerificationToken(verificationToken) {
		return await TokenHelper.#verifyToken(verificationToken, process.env.VERIFICATION_TOKEN_SECRET);
	}

	static async generateAccessRefreshTokens(payload) {
		const accessToken = await TokenHelper.#generateToken(
			payload,
			process.env.ACCESS_TOKEN_SECRET,
			process.env.ACCESS_TOKEN_EXPIRES_IN
		);

		const refreshToken = await TokenHelper.#generateToken(
			payload,
			process.env.REFRESH_TOKEN_SECRET,
			process.env.REFRESH_TOKEN_EXPIRES_IN
		);

		return { accessToken, refreshToken };
	}

	static async verifyAccessToken(accessToken) {
		return await TokenHelper.#verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET);
	}

	static async verifyRefreshToken(refreshToken) {
		return await TokenHelper.#verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
	}

	static async #generateToken(payload, secret, expiresIn) {
		payload = { ...payload, origin: ORIGIN.IDENTITY_PROVIDER, permission: PERMISSION.READ_WRITE_DELETE };

		return await jwt.sign(payload, secret, {
			expiresIn,
		});
	}

	static async #verifyToken(token, secret) {
		return await jwt.verify(token, secret);
	}
}

module.exports = TokenHelper;
