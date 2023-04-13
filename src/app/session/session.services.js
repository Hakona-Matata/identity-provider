const SessionRepository = require("./session.repositories");
const TokenHelper = require("./../../helpers/token");

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

		return foundAccountSessions.map((session) => {
			return {
				sessionId: session._id,
			};
		});
	}

	static async cancel(accountId, sessionId) {
		const isSessionFoundAndDeleted = await SessionRepository.deleteSessionBySessionId(sessionId, accountId);

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

		await SessionRepository.deleteSessionByRefreshToken(refreshToken, accountId);

		return await SessionServices.create({
			accountId,
			role,
		});
	}
}

module.exports = SessionServices;
