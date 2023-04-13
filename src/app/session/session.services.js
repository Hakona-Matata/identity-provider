const TokenHelper = require("./../../helpers/token");
const SessionRepository = require("./session.repositories");

const { SUCCESS_MESSAGES, FAILIURE_MESSAGES } = require("./../../constants/messages");
const NotFoundException = require("./../../Exceptions/common/notFound.exception");
const ForbiddenException = require("../../Exceptions/common/forbidden.exception");

class SessionServices {
	static async create(payload = { accountId: "", role: "" }) {
		const { accessToken, refreshToken } = await SessionRepository.createReturnSession(payload);

		return { accessToken, refreshToken };
	}

	static async findOne(accountId, accessToken) {
		return await SessionRepository.findOneSession(accountId, accessToken);
	}

	static async findAll(accountId) {
		const foundAccountSessions = await SessionRepository.findAllSesssions(accountId);

		return await SessionServices.#categorizeAndSortSessionsByValidity(foundAccountSessions);
	}

	static async cancel(accountId, sessionId) {
		const isSessionFoundAndDeleted = await SessionRepository.cancelSessionBySessionId(sessionId, accountId);

		if (!isSessionFoundAndDeleted) {
			throw new NotFoundException(FAILIURE_MESSAGES.SESSION_NOT_FOUND);
		}

		return SUCCESS_MESSAGES.SESSION_CANCELED_SUCCESSFULLY;
	}

	static async renew(refreshToken) {
		const { accountId, role } = await TokenHelper.verifyRefreshToken(refreshToken);

		const isSessionFound = await SessionRepository.renewSession(accountId, refreshToken);

		if (!isSessionFound) {
			throw new ForbiddenException(FAILIURE_MESSAGES.FORBIDDEN_EXPIRED_SESSION);
		}

		await SessionRepository.cancelSessionByRefreshToken(refreshToken, accountId);

		return await SessionServices.create({
			accountId,
			role,
		});
	}

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
