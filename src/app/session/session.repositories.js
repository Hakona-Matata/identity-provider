const TokenHelper = require("./../../helpers/token");
const SessionModel = require("./session.model");

class SessionRepository {
	static async createReturnSession(payload) {
		const { accessToken, refreshToken } = await TokenHelper.generateAccessRefreshTokens(payload);

		return await SessionModel.create({ accessToken, refreshToken, accountId: payload.accountId });
	}

	static async findAccountSesssions(accountId) {
		return await SessionModel.find({ accountId }).lean();
	}
}

module.exports = SessionRepository;
