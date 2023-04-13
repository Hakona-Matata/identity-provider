const { SsmlPhoneme } = require("twilio/lib/twiml/VoiceResponse");
const TokenHelper = require("./../../helpers/token");
const SessionModel = require("./session.model");

class SessionRepository {
	static async createReturnSession(payload = { accountId: "", role: "" }) {
		const { accessToken, refreshToken } = await TokenHelper.generateAccessRefreshTokens(payload);

		const createdSession = await SessionModel.create({ accessToken, refreshToken, accountId: payload.accountId });

		return createdSession;
	}

	static async findOneSession(accountId, accessToken) {
		return await SessionModel.findOne({ accountId, accessToken }).lean();
	}

	static async findAllSesssions(accountId) {
		return await SessionModel.find({ accountId }).lean();
	}

	static async cancelSessionBySessionId(sessionId, accountId) {
		return await SessionModel.findOneAndDelete({
			_id: sessionId,
			accountId,
		});
	}

	static async cancelSessionByRefreshToken(refreshToken, accountId) {
		return await SessionModel.findOneAndDelete({
			refreshToken,
			accountId,
		});
	}

	static async renewSession(accountId, refreshToken) {
		return await SessionModel.findOne({ accountId, refreshToken }).lean();
	}
}

module.exports = SessionRepository;
