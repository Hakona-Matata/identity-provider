const jwt = require("jsonwebtoken");

const ORIGIN = require("../constants/origin");
const TOKENS = require("../constants/tokens");
class TokenHelper {
	static async generateVerificationToken(payload) {
		return await TokenHelper.#generateToken(
			{ ...payload, label: TOKENS.VERIFICATION_TOKEN },
			process.env.VERIFICATION_TOKEN_SECRET,
			process.env.VERIFICATION_TOKEN_EXPIRES_IN
		);
	}

	static async verifyVerificationToken(verificationToken) {
		return await TokenHelper.#verifyToken(verificationToken, process.env.VERIFICATION_TOKEN_SECRET);
	}

	static async generateAccessRefreshTokens(payload = { accountId: "", role: "" }) {
		const accessToken = await TokenHelper.#generateToken(
			{ ...payload, label: TOKENS.ACCESS_TOKEN },
			process.env.ACCESS_TOKEN_SECRET,
			process.env.ACCESS_TOKEN_EXPIRES_IN
		);

		const refreshToken = await TokenHelper.#generateToken(
			{ ...payload, label: TOKENS.REFRESH_TOKEN },
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
		return await jwt.sign({ ...payload, origin: ORIGIN.IDENTITY_PROVIDER }, secret, {
			expiresIn,
		});
	}

	static async #verifyToken(token, secret) {
		return await jwt.verify(token, secret);
	}
}

module.exports = TokenHelper;
