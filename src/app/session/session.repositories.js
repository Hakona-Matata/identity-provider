const { SsmlPhoneme } = require("twilio/lib/twiml/VoiceResponse");
const TokenHelper = require("./../../helpers/token");
const SessionModel = require("./session.model");

class SessionRepository {
	static async createReturnSession(payload) {
		const { accessToken, refreshToken } = await TokenHelper.generateAccessRefreshTokens(payload);

		const createdSession = await SessionModel.create({ accessToken, refreshToken, accountId: payload.accountId });
		console.log({ createdSession });
		return createdSession;
	}

	static async findSession(accountId, accessToken) {
		return await SessionModel.findOne({ accountId, accessToken });
	}

	static async findAccountSesssions(accountId) {
		return await SessionModel.find({ accountId }).lean();
	}

	static async cancelSession(sessionId, userId) {
		return await SessionModel.findOneAndDelete({
			_id: sessionId,
			userId,
		});
	}
}

module.exports = SessionRepository;
