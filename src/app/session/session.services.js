const {
	SUCCESS_MESSAGES: { SESSION_CANCELED_SUCCESSFULLY },
	FAILIURE_MESSAGES: { SESSION_EXPIRED, SESSION_CREATE_FAILED, SESSION_READ_FAILED, SESSION_DELETE_FAILED },
} = require("./session.constants");

const InternalServerException = require("../../Exceptions/common/internalServer.exception");

const SessionRepository = require("./session.repositories");

const TokenHelper = require("./../../helpers/token");

class SessionServices {
	/* 
		=======================================
			Public methods 
		=======================================
	*/

	static async cancel({ accountId, sessionId }) {
		await SessionServices.deleteOne({ sessionId, accountId });

		return SESSION_CANCELED_SUCCESSFULLY;
	}

	static async renew(refreshToken) {
		const { accountId, role } = await TokenHelper.verifyRefreshToken(refreshToken);

		await SessionServices.findOne({ accountId, refreshToken });

		await SessionServices.deleteOne({ accountId, refreshToken });

		return await SessionServices.create({
			accountId,
			role,
		});
	}

	static async validate(accessToken) {
		const decodedAccessToken = await TokenHelper.verifyAccessToken(accessToken);

		return { isValid: true, ...decodedAccessToken };
	}

	/* 
		=======================================
			CRUD methods 
		=======================================
	*/

	static async create(payload) {
		const isSessionCreated = await SessionRepository.create(payload);

		if (!isSessionCreated) {
			throw new InternalServerException(SESSION_CREATE_FAILED);
		}
		const { accessToken, refreshToken } = isSessionCreated;

		return { accessToken, refreshToken };
	}

	static async findOne(payload) {
		const isSessionFound = await SessionRepository.findOne(payload);

		if (!isSessionFound) {
			throw new InternalServerException(SESSION_EXPIRED);
		}

		return isSessionFound;
	}

	static async find(accountId) {
		const foundSessions = await SessionRepository.find(accountId);

		if (!foundSessions || foundSessions.length < 1) {
			throw new InternalServerException(SESSION_READ_FAILED);
		}

		return foundSessions;
	}

	static async deleteOne(payload) {
		const { deletedCount } = await SessionRepository.deleteOne(payload);

		if (deletedCount === 0) {
			throw new InternalServerException(SESSION_EXPIRED);
		}
	}

	static async delete(accountId) {
		const { deletedCount } = await SessionRepository.delete(accountId);

		if (deletedCount === 0) {
			throw new InternalServerException(SESSION_DELETE_FAILED);
		}
	}
}

module.exports = SessionServices;
