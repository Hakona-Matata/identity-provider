const SessionRepository = require("./session.repositories");
const TokenHelper = require("./../../helpers/token");

const {
	SUCCESS_MESSAGES: { SESSION_CANCELED_SUCCESSFULLY },
	FAILIURE_MESSAGES: { SESSION_CANCELED, SESSION_NOT_FOUND, SESSION_EXPIRED },
} = require("./../../constants/messages");
const NotFoundException = require("./../../Exceptions/common/notFound.exception");
const ForbiddenException = require("../../Exceptions/common/forbidden.exception");

class SessionServices {
	static async create(payload	) {
		const { accessToken, refreshToken } = await SessionRepository.create(payload);

		return { accessToken, refreshToken };
	}

	static async findOne(accountId, accessToken) {
		const isSessionFound = await SessionRepository.findOne({ accountId, accessToken });

		if (!isSessionFound) {
			throw new ForbiddenException(SESSION_CANCELED);
		}

		return isSessionFound;
	}

	static async findAll(accountId) {
		const foundAccountSessions = await SessionRepository.find(accountId);

		return foundAccountSessions.map((session) => {
			return {
				sessionId: session._id,
			};
		});
	}

	static async cancel(accountId, sessionId) {
		const isSessionFoundAndDeleted = await SessionRepository.deleteSessionBySessionId(sessionId, accountId);

		if (!isSessionFoundAndDeleted) {
			throw new NotFoundException(SESSION_NOT_FOUND);
		}

		return SESSION_CANCELED_SUCCESSFULLY;
	}

	static async renew(refreshToken) {
		const { accountId, role } = await TokenHelper.verifyRefreshToken(refreshToken);

		const isSessionFound = await SessionRepository.findOne({ accountId, refreshToken });

		if (!isSessionFound) {
			throw new ForbiddenException(SESSION_EXPIRED);
		}

		await SessionRepository.deleteOne(null, accountId, null, refreshToken);

		return await SessionServices.create({
			accountId,
			role,
		});
	}
}

module.exports = SessionServices;
