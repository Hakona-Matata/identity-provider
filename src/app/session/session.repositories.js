const SessionModel = require("./session.model");
const TokenHelper = require("./../../helpers/token");

class SessionRepository {
	static async createReturnSession(payload = { accountId: "", role: "" }) {
		const { accessToken, refreshToken } = await TokenHelper.generateAccessRefreshTokens(payload);

		return await SessionModel.create({ accessToken, refreshToken, accountId: payload.accountId });
	}

	static async findOneSession(accountId, accessToken) {
		return await SessionModel.findOne({ accountId, accessToken }).lean();
	}

	static async findAllSesssions(accountId) {
		return await SessionModel.find({ accountId }).lean();
	}

	static async deleteSessionBySessionId(sessionId, accountId) {
		return await SessionModel.findOneAndDelete({
			_id: sessionId,
			accountId,
		});
	}

	static async deleteSessionByRefreshToken(refreshToken, accountId) {
		return await SessionModel.findOneAndDelete({
			refreshToken,
			accountId,
		});
	}

	static async deleteAllSessionsByAccountId(accountId) {
		return await SessionModel.deleteMany({ _id: accountId });
	}

	static async renewSession(accountId, refreshToken) {
		return await SessionModel.findOne({ accountId, refreshToken }).lean();
	}
}

module.exports = SessionRepository;
