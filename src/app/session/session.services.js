const TokenHelper = require("./../../helpers/token");
const SessionRepository = require("./session.repositories");

class SessionServices {
	static async create(payload) {
		const { accessToken, refreshToken } = await SessionRepository.createReturnSession(payload);

		return { accessToken, refreshToken };
	}

	static async getAll(accountId) {
		const foundAccountSessions = await SessionRepository.findAccountSesssions(accountId);

		return await SessionServices.#categorizeAndSortSessionsByValidity(foundAccountSessions);
	}

	static async cancel({ userId, sessionId }) {
		const isCurrentSessionDeleted = await Session.findOneAndDelete({
			userId,
			_id: sessionId,
		});

		if (!isCurrentSessionDeleted) {
			throw new CustomError({
				status: STATUS.FORBIDDEN,
				code: CODE.FORBIDDEN,
				message: "Sorry, you can't cancel this session!",
			});
		}

		return "Session is cancelled successfully!";
	}

	static async renew() {}

	static async #categorizeAndSortSessionsByValidity(sessions) {
		const categorizedSessionsByIsValid = await Promise.all(
			sessions.map(async (session) => {
				try {
					await TokenHelper.verifyRefreshToken(session.refreshToken);

					return (session = { _id: session._id, isValid: true });
				} catch (error) {
					return (session = { _id: session._id, isValid: false });
				}
			})
		);

		return categorizedSessionsByIsValid.sort((a, b) => Number(b.isValid) - Number(a.isValid));
	}
}

module.exports = SessionServices;
