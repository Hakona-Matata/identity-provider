const TokenHelper = require("./../../helpers/token");
const SessionRepository = require("./session.repositories");

const { SUCCESS_MESSAGES, FAILIURE_MESSAGES } = require("./../../constants/messages");
const NotFoundException = require("./../../Exceptions/common/notFound.exception");

class SessionServices {
	static async create(payload) {
		const { accessToken, refreshToken } = await SessionRepository.createReturnSession(payload);

		return { accessToken, refreshToken };
	}

	static async isSessionFound(accountId, accessToken) {
		return await SessionRepository.findSession(accountId, accessToken);
	}

	static async getAll(accountId) {
		const foundAccountSessions = await SessionRepository.findAccountSesssions(accountId);

		return await SessionServices.#categorizeAndSortSessionsByValidity(foundAccountSessions);
	}

	static async cancel({ userId, sessionId }) {
		const isSessionFoundAndDeleted = await SessionRepository.cancelSession(sessionId, userId);

		if (!isSessionFoundAndDeleted) {
			throw new NotFoundException(FAILIURE_MESSAGES.SESSION_NOT_FOUND);
		}

		return SUCCESS_MESSAGES.SESSION_CANCELED_SUCCESSFULLY;
	}

	static async renew() {}

	static async #categorizeAndSortSessionsByValidity(sessions) {
		const categorizedSessionsByIsValid = await Promise.all(
			sessions.map(async (session) => {
				try {
					await TokenHelper.verifyRefreshToken(session.refreshToken);

					return (session = { _id: session._id, isValid: true });
				} catch (error) {
					return (session = { _id: session._id, isValid: false });
				}
			})
		);

		return categorizedSessionsByIsValid.sort((a, b) => Number(b.isValid) - Number(a.isValid));
	}
}

module.exports = SessionServices;
