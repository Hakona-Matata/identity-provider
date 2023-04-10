const TokenHelper = require("./../../helpers/token");
const SessionModel = require("./session.model");

class SessionRepository {
	static async createReturnSession(payload) {
		const { accessToken, refreshToken } = await TokenHelper.generateAccessRefreshTokens(payload);

		const createdSession = await SessionModel.create({ accessToken, refreshToken, accountId: payload.accountId });
		console.log({ createdSession });
		return createdSession;
	}

	static async findAccountSesssions(accountId) {
		return await SessionModel.find({ accountId }).lean();
	}
}

module.exports = SessionRepository;
