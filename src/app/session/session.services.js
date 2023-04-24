const InternalServerException = require("../../exceptions/common/internalServer.exception");
const NotFoundException = require("./../../exceptions/common/notFound.exception");
const SessionRepository = require("./session.repositories");
const TokenHelper = require("./../../helpers/token");

const {
	SUCCESS_MESSAGES: { SESSION_CANCELED_SUCCESSFULLY },
	FAILIURE_MESSAGES: {
		SESSION_NOT_FOUND,
		SESSIONS_NOT_FOUND,
		SESSION_CREATION_FAILED,
		SESSION_DELETION_FAILED,
		SESSIONS_DELETION_FAILED,
		SESSION_REVOKED,
	},
} = require("./session.constants");

class SessionServices {
	/* 
		=======================================
			Public methods 
		=======================================
	*/

	static async cancel({ accountId, sessionId }) {
		await SessionServices.deleteOne({ _id: sessionId, accountId });

		return SESSION_CANCELED_SUCCESSFULLY;
	}

	static async renew(refreshToken) {
		const { accountId, role } = await TokenHelper.verifyRefreshToken(refreshToken);

		await SessionServices.findOne({ accountId, refreshToken });

		await SessionServices.deleteOne({ accountId, refreshToken });

		return await SessionServices.createOne({
			accountId,
			role,
		});
	}

	static async validate(accessToken) {
		const decodedAccessToken = await TokenHelper.verifyAccessToken(accessToken);

		await SessionServices.findOne({ accountId: decodedAccessToken.accountId, accessToken });

		return { isValid: true, ...decodedAccessToken };
	}

	/* 
		=======================================
			CRUD methods 
		=======================================
	*/

	static async createOne(payload) {
		const sessionTokens = await TokenHelper.generateAccessRefreshTokens(payload);

		const isSessionCreated = await SessionRepository.insertOne({ ...payload, ...sessionTokens });

		if (!isSessionCreated) {
			throw new InternalServerException(SESSION_CREATION_FAILED);
		}

		return { accessToken: isSessionCreated.accessToken, refreshToken: isSessionCreated.refreshToken };
	}

	static async findOne(filter) {
		const isSessionFound = await SessionRepository.findOne(filter);

		if (!isSessionFound) {
			throw new NotFoundException(SESSION_REVOKED);
		}

		return isSessionFound;
	}

	static async findMany(filter) {
		return await SessionRepository.findMany(filter);
	}

	static async deleteOne(filter) {
		const isSessionDeleted = await SessionRepository.deleteOne(filter);

		if (!isSessionDeleted) {
			throw new NotFoundException(SESSION_NOT_FOUND);
		} else if (isSessionDeleted.deletedCount === 0) {
			throw new InternalServerException(SESSION_DELETION_FAILED);
		}
	}

	static async deleteMany(filter) {
		const areSessionsDeleted = await SessionRepository.deleteMany(filter);

		console.log({ areSessionsDeleted });

		if (!areSessionsDeleted) {
			throw new NotFoundException(SESSIONS_NOT_FOUND);
		} else if (areSessionsDeleted.deletedCount === 0) {
			throw new InternalServerException(SESSIONS_DELETION_FAILED);
		}
	}
}

module.exports = SessionServices;
