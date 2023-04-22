const InternalServerException = require("../../Exceptions/common/internalServer.exception");
const NotFoundException = require("./../../Exceptions/common/notFound.exception");
const SessionRepository = require("./session.repositories");
const TokenHelper = require("./../../helpers/token");

const {
	SUCCESS_MESSAGES: { SESSION_CANCELED_SUCCESSFULLY },
	FAILIURE_MESSAGES: {
		SESSION_NOT_FOUND,
		SESSION_EXPIRED,
		SESSION_CREATE_FAILED,
		SESSION_READ_FAILED,
		SESSION_DELETE_FAILED,
	},
} = require("./session.constants");

class SessionServices {
	/* 
		=======================================
			Public methods 
		=======================================
	*/

	static async cancel({ accountId, sessionId }) {
		const isSessionDeleted = await SessionServices.deleteOne({ sessionId, accountId });

		if (!isSessionDeleted) {
			throw new NotFoundException(SESSION_NOT_FOUND);
		}

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

		return { isValid: true, ...decodedAccessToken };
	}

	/* 
		=======================================
			CRUD methods 
		=======================================
	*/

	static async createOne(payload) {
		const sessionTokens = await TokenHelper.generateAccessRefreshTokens(payload);

		return await SessionRepository.insertOne({ ...payload, ...sessionTokens });
	}

	static async findOne(filter) {
		return await SessionRepository.findOne(filter);
	}

	static async findMany(accountId) {
		return await SessionRepository.findMany({ accountId });
	}

	static async deleteOne(filter) {
		return await SessionRepository.deleteOne(filter);
	}

	static async deleteMany(accountId) {
		return await SessionRepository.delete({ accountId });
	}
}

module.exports = SessionServices;
