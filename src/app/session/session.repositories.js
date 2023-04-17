const SessionModel = require("./session.model");
const TokenHelper = require("./../../helpers/token");

class SessionRepository {
	static async create(payload) {
		const { accessToken, refreshToken } = await TokenHelper.generateAccessRefreshTokens({ ...payload });

		return await SessionModel.create({ accessToken, refreshToken, accountId: payload.accountId });
	}

	static async findOne(payload) {
		return await SessionModel.findOne({ ...payload }).lean();
	}

	static async find(accountId) {
		return await SessionModel.find({ accountId }).lean();
	}

	static async deleteOne(payload) {
		return await SessionModel.findOneAndDelete({
			...payload,
		});
	}

	static async delete(accountId) {
		return await SessionModel.deleteMany({ accountId });
	}
}

module.exports = SessionRepository;
