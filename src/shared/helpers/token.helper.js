const jwt = require("jsonwebtoken");

const { IDENTITY_PROVIDER } = require("../constants/index");
const {
	tokens: { VERIFICATION_TOKEN, ACCESS_TOKEN, REFRESH_TOKEN, RESET_TOKEN, ACTIVATION_TOKEN },
} = require("../constants/index");

/**
 * A helper class that provides functions to generate, verify and decode JWT tokens.
 *
 * @class
 */
class TokenHelper {
	/**
	 *  Generates a verification token for a given account ID and role.
	 * @async
	 * @param {Object} params - The parameters required to generate the verification token.
	 * @param {string} params.accountId - The account ID to generate the token for.
	 * @param {string} params.role - The role of the account to generate the token for.
	 * @returns {Promise<string>} A promise that resolves with the verification token.
	 */
	static async generateVerificationToken({ accountId, role }) {
		return await TokenHelper.#generateToken(
			{ accountId, role, label: VERIFICATION_TOKEN },
			process.env.VERIFICATION_TOKEN_SECRET,
			process.env.VERIFICATION_TOKEN_EXPIRES_IN
		);
	}

	/**
	 * Verifies a verification token.
	 * @async
	 * @param {string} verificationToken - The verification token to verify.
	 * @returns {Promise<Object>} A promise that resolves with the decoded token payload.
	 */
	static async verifyVerificationToken(verificationToken) {
		return await TokenHelper.#verifyToken(verificationToken, process.env.VERIFICATION_TOKEN_SECRET);
	}

	/**
	 * Generates an access token and a refresh token for a given account ID and role.
	 * @async
	 * @param {Object} params - The parameters required to generate the tokens.
	 * @param {string} params.accountId - The account ID to generate the tokens for.
	 * @param {string} params.role - The role of the account to generate the tokens for.
	 * @returns {Promise<Object>} A promise that resolves with an object containing the access and refresh tokens.
	 */
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

	/**
	 * Verifies an access token.
	 *
	 * @async
	 * @param {string} accessToken - The access token to verify.
	 * @returns {Promise<Object>} A promise that resolves with the decoded token payload.
	 */
	static async verifyAccessToken(accessToken) {
		return await TokenHelper.#verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET);
	}

	/**
	 * Verifies a refresh token.
	 *
	 * @async
	 * @param {string} refreshToken - The refresh token to verify.
	 * @returns {Promise<Object>} A promise that resolves with the decoded token payload.
	 */
	static async verifyRefreshToken(refreshToken) {
		return await TokenHelper.#verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
	}

	/**
	 * Generates a reset token for a given account ID and role.
	 *
	 * @async
	 * @param {Object} params - The parameters required to generate the reset token.
	 * @param {string} params.accountId - The account ID to generate the token for.
	 * @param {string} params.role - The role of the account to generate the token for.
	 * @returns {Promise<string>} A promise that resolves with the reset token.
	 */
	static async generateResetToken({ accountId, role }) {
		return await TokenHelper.#generateToken(
			{ accountId, role, label: RESET_TOKEN },
			process.env.RESET_TOKEN_SECRET,
			process.env.RESET_TOKEN_EXPIRES_IN
		);
	}

	/**
	 * Verifies a reset token.
	 *
	 * @async
	 * @param {string} resetToken - The reset token to verify.
	 * @returns {Promise<Object>} A promise that resolves with the decoded token payload.
	 */
	static async verifyResetToken(resetToken) {
		return await TokenHelper.#verifyToken(resetToken, process.env.RESET_TOKEN_SECRET);
	}

	/**
	 * Generates an activation token for a given account ID and role.
	 *
	 * @async
	 * @param {Object} params - The parameters required to generate the activation token.
	 * @param {string} params.accountId - The account ID to generate the token for.
	 * @param {string} params.role - The role of the account to generate the token for.
	 * @returns {Promise<string>} A promise that resolves with the activation token.
	 */
	static async generateActivationToken({ accountId, role }) {
		return await TokenHelper.#generateToken(
			{ accountId, role, label: ACTIVATION_TOKEN },
			process.env.ACTIVATION_TOKEN_SECRET,
			process.env.ACTIVATION_TOKEN_EXPIRES_IN
		);
	}

	/**
	 * Verifies an activation token.
	 *
	 * @async
	 * @param {string} activationToken - The activation token to verify.
	 * @returns {Promise<object>} A promise that resolves with the decoded token if it's valid, otherwise it rejects with an error.
	 */
	static async verifyActivationToken(activationToken) {
		return await TokenHelper.#verifyToken(activationToken, process.env.ACTIVATION_TOKEN_SECRET);
	}

	/**
	 * Generates a token with the specified payload, secret, and expiration time.
	 *
	 * @private
	 * @async
	 * @param {object} payload - The payload to include in the token.
	 * @param {string} secret - The secret key to use for signing the token.
	 * @param {string | number} expiresIn - The amount of time before the token expires, expressed as a string (e.g. '2 days') or a number of seconds.
	 * @returns {Promise<string>} A promise that resolves with the generated token.
	 */
	static async #generateToken(payload, secret, expiresIn) {
		return await jwt.sign({ ...payload, origin: IDENTITY_PROVIDER }, secret, {
			expiresIn,
		});
	}

	/**
	 * Verifies a token with the specified secret.
	 *
	 * @private
	 * @async
	 * @param {string} token - The token to verify.
	 * @param {string} secret - The secret key to use for verifying the token.
	 * @returns {Promise<object>} A promise that resolves with the decoded token if it's valid, otherwise it rejects with an error.
	 */
	static async #verifyToken(token, secret) {
		return await jwt.verify(token, secret);
	}
}

module.exports = TokenHelper;
