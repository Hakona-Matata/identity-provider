const jwt = require("jsonwebtoken");

const { IDENTITY_PROVIDER } = require("../constants/origin");
const {
	VERIFICATION_TOKEN,
	ACCESS_TOKEN,
	REFRESH_TOKEN,
	RESET_TOKEN,
	ACTIVATION_TOKEN,
} = require("../constants/tokens");
class TokenHelper {
	static async generateVerificationToken({ accountId, role }) {
		return await TokenHelper.#generateToken(
			{ accountId, role, label: VERIFICATION_TOKEN },
			process.env.VERIFICATION_TOKEN_SECRET,
			process.env.VERIFICATION_TOKEN_EXPIRES_IN
		);
	}

	static async verifyVerificationToken(verificationToken) {
		return await TokenHelper.#verifyToken(verificationToken, process.env.VERIFICATION_TOKEN_SECRET);
	}

	static async generateAccessRefreshTokens({ accountId, role }) {
		const payload = { accountId, role };

		const accessToken = await TokenHelper.#generateToken(
			{ ...payload, label: ACCESS_TOKEN },
			process.env.ACCESS_TOKEN_SECRET,
			process.env.ACCESS_TOKEN_EXPIRES_IN
		);

		const refreshToken = await TokenHelper.#generateToken(
			{ ...payload, label: REFRESH_TOKEN },
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

	static async generateResetToken({ accountId, role }) {
		return await TokenHelper.#generateToken(
			{ accountId, role, label: RESET_TOKEN },
			process.env.RESET_TOKEN_SECRET,
			process.env.RESET_TOKEN_EXPIRES_IN
		);
	}

	static async verifyResetToken(resetToken) {
		return await TokenHelper.#verifyToken(resetToken, process.env.RESET_TOKEN_SECRET);
	}

	static async generateActivationToken({ accountId, role }) {
		return await TokenHelper.#generateToken(
			{ accountId, role, label: ACTIVATION_TOKEN },
			process.env.ACTIVATION_TOKEN_SECRET,
			process.env.ACTIVATION_TOKEN_EXPIRES_IN
		);
	}

	static async verifyActivationToken(activationToken) {
		return await TokenHelper.#verifyToken(activationToken, process.env.ACTIVATION_TOKEN_SECRET);
	}

	static async #generateToken(payload, secret, expiresIn) {
		return await jwt.sign({ ...payload, origin: IDENTITY_PROVIDER }, secret, {
			expiresIn,
		});
	}

	static async #verifyToken(token, secret) {
		return await jwt.verify(token, secret);
	}
}

module.exports = TokenHelper;
