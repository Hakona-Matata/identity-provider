const {
	SUCCESS_MESSAGES: { SESSION_CANCELED_SUCCESSFULLY },
	FAILURE_MESSAGES: { SESSION_REVOKED },
} = require("./session.constants");

const { ForbiddenException, UnAuthorizedException } = require("../../../shared/exceptions");

const SessionRepository = require("./session.repositories");

const { TokenHelper } = require("../../../shared/helpers");

/**
 * A class representing Session services.
 *
 * @class
 */
class SessionServices {
	/**
	 * Cancel a session.
	 *
	 * @static
	 * @param {Object} params - The parameters for canceling a session.
	 * @param {string} params.accountId - The id of the account associated with the session.
	 * @param {string} params.sessionId - The id of the session to cancel.
	 * @returns {string} The message indicating the session was canceled successfully.
	 */
	static async cancel({ accountId, sessionId }) {
		await SessionServices.findOne({ _id: sessionId, accountId });

		await SessionServices.deleteOne({ _id: sessionId, accountId });

		return SESSION_CANCELED_SUCCESSFULLY;
	}

	/**
	 * Renew a session.
	 *
	 * @static
	 * @param {string} refreshToken - The refresh token used to renew the session.
	 * @returns {Object} An object containing the new access and refresh tokens.
	 */
	static async renew(refreshToken) {
		const { accountId, role } = await TokenHelper.verifyRefreshToken(refreshToken);

		await SessionServices.findOne({ accountId, refreshToken });

		await SessionServices.deleteOne({ accountId, refreshToken });

		return await SessionServices.createOne({
			accountId,
			role,
		});
	}

	/**
	 * Validate an access token.
	 * @static
	 * @param {string} accessToken - The access token to validate.
	 * @returns {Object} An object containing the decoded access token and a flag indicating if it's valid.
	 */
	static async validate(accessToken) {
		const decodedAccessToken = await TokenHelper.verifyAccessToken(accessToken);

		const isSessionFound = await SessionServices.findOne({ accountId: decodedAccessToken.accountId, accessToken });

		if (!isSessionFound) throw new UnAuthorizedException(SESSION_REVOKED);

		return { isValid: true, ...decodedAccessToken };
	}

	/**
	 * Handles the creation of a new session for the user.
	 *
	 * @async
	 * @function createOne
	 * @param {object} payload - Object containing information about the session to be created.
	 * @param {string} payload.accountId - The ID of the user account.
	 * @param {string} payload.role - The role of the user account.
	 * @returns {Promise<object>} Object containing the access and refresh tokens for the newly created session.
	 */
	static async createOne(payload) {
		const sessionTokens = await TokenHelper.generateAccessRefreshTokens(payload);

		const createdSession = await SessionRepository.insertOne({ ...payload, ...sessionTokens });

		return { accessToken: createdSession.accessToken, refreshToken: createdSession.refreshToken };
	}

	/**
	 * Retrieves a single session matching the provided filter.
	 *
	 * @async
	 * @function findOne
	 * @param {object} filter - Object containing properties to filter the search for a session.
	 * @returns {Promise<object>} Object containing information about the found session.
	 */

	static async findOne(filter) {
		const isSessionFound = await SessionRepository.findOne(filter);

		if (!isSessionFound) {
			throw new ForbiddenException(SESSION_REVOKED);
		}

		return isSessionFound;
	}

	/**
	 * Retrieves an array of sessions matching the provided filter.
	 *
	 * @async
	 * @function findMany
	 * @param {object} filter - Object containing properties to filter the search for sessions.
	 * @returns {Promise<Array>} Array containing objects representing the found sessions.
	 */
	static async findMany(filter) {
		return await SessionRepository.findMany(filter);
	}

	/**
	 * Delete a session based on the provided filter.
	 *
	 * @param {Object} filter - The filter to determine which session(s) to delete.
	 * @throws {InternalServerException} If session deletion fails.
	 * @returns {Promise<void>} A promise that resolves when the session is deleted successfully.
	 */
	static async deleteOne(filter) {
		return await SessionRepository.deleteOne(filter);
	}

	/** Delete multiple sessions based on the provided filter.
	 *
	 * @param {Object} filter - The filter to determine which sessions to delete.
	 * @throws {InternalServerException} If sessions deletion fails.
	 * @returns {Promise<void>} A promise that resolves when the sessions are deleted successfully.
	 */
	static async deleteMany(filter) {
		return await SessionRepository.deleteMany(filter);
	}
}

module.exports = SessionServices;
