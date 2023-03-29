const CustomError = require("./../../Errors/CustomError");
const STATUS = require("../../constants/statusCodes");
const CODE = require("../../constants/errorCodes");

const { verify_token } = require("./../../helpers/token");
const give_access = require("./../../helpers/giveAccess");

const Session = require("./../Models/Session.model");

const all_sessions_GET_service = async (userId) => {
	const sessions = await Session.find({ userId }).select("-userId").lean();

	const sessionWithValidityStatus = await Promise.all(
		sessions.map(async (session) => {
			try {
				await verify_token({
					token: session.refreshToken,
					secret: process.env.REFRESH_TOKEN_SECRET,
				});

				return (session = { _id: session._id, isValid: true });
			} catch (error) {
				return (session = { _id: session._id, isValid: false });
			}
		})
	);

	const sortedSessions = sessionWithValidityStatus.sort(
		(a, b) => Number(b.isValid) - Number(a.isValid)
	);

	return {
		count: sessions.length,
		sessions: sortedSessions,
	};
};

const cancel_session_POST_service = async ({ userId, sessionId }) => {
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
};

const renew_session_POST_service = async ({ givenRefreshToken }) => {
	const decodedRefreshToken = await verify_token({
		token: givenRefreshToken,
		secret: process.env.REFRESH_TOKEN_SECRET,
	});

	const isCurrentSessionDeleted = await Session.findOneAndDelete({
		refreshToken: givenRefreshToken,
	});

	if (!isCurrentSessionDeleted) {
		throw new CustomError({
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, this refresh token is revoked/ disabled!",
		});
	}

	return await give_access({ user: { _id: decodedRefreshToken._id } });
};

module.exports = {
	all_sessions_GET_service,
	cancel_session_POST_service,
	renew_session_POST_service,
};
