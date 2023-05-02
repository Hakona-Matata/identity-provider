const { InternalServerException, ForbiddenException } = require("../../exceptions/");

const SessionRepository = require("./session.repositories");
const TokenHelper = require("../../helpers/tokenHelper");

const {
	SUCCESS_MESSAGES: { SESSION_CANCELED_SUCCESSFULLY },
	FAILURE_MESSAGES: { SESSION_CREATION_FAILED, SESSION_DELETION_FAILED, SESSIONS_DELETION_FAILED, SESSION_REVOKED },
} = require("./session.constants");

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

		await SessionServices.findOne({ accountId: decodedAccessToken.accountId, accessToken });

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

		const isSessionCreated = await SessionRepository.insertOne({ ...payload, ...sessionTokens });

		if (!isSessionCreated) {
			throw new InternalServerException(SESSION_CREATION_FAILED);
		}

		return { accessToken: isSessionCreated.accessToken, refreshToken: isSessionCreated.refreshToken };
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
		const { deletedCount } = await SessionRepository.deleteOne(filter);

		if (deletedCount === 0) throw new InternalServerException(SESSION_DELETION_FAILED);
	}

	/** Delete multiple sessions based on the provided filter.
	 *
	 * @param {Object} filter - The filter to determine which sessions to delete.
	 * @throws {InternalServerException} If sessions deletion fails.
	 * @returns {Promise<void>} A promise that resolves when the sessions are deleted successfully.
	 */
	static async deleteMany(filter) {
		const { deletedCount } = await SessionRepository.deleteMany(filter);

		if (deletedCount === 0) throw new InternalServerException(SESSIONS_DELETION_FAILED);
	}
}

module.exports = SessionServices;
