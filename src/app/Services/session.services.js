const Session = require("./../Models/Session.model");
const { verify_token, give_access } = require("./../../helpers/token");
const CustomError = require("./../../Errors/CustomError");

const all_sessions_GET_service = async (userId) => {
	// (1) Get all user session from DB
	const sessions = await Session.find({ userId }).select("-userId").lean();

	// (2) Verify those session tokens!
	const sessionWithStatus = await Promise.all(
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

	// (3) Sort and return sessions (valid, expired)
	return {
		count: sessions.length,
		sessions: sessionWithStatus.sort(
			(a, b) => Number(b.isValid) - Number(a.isValid)
		),
	};
};

const cancel_session_POST_service = async ({ userId, sessionId }) => {
	const done = await Session.findOneAndDelete({ userId, _id: sessionId });

	if (!done) {
		throw new CustomError(
			"UnAuthorized",
			"Sorry, you can't cancel this session!"
		);
	}

	return "Session is cancelled successfully";
};

const renew_session_POST_service = async ({ givenRefreshToken }) => {
	// (1) Verify refresh token
	const decoded = await verify_token({
		token: givenRefreshToken,
		secret: process.env.REFRESH_TOKEN_SECRET,
	});

	// (2) Delete old session
	const deleted = await Session.findOneAndDelete({
		refreshToken: givenRefreshToken,
	});

	if (!deleted) {
		throw new CustomError(
			"UnAuthorized",
			"Sorry, this refresh token is revoked!"
		);
	}

	// (3) Return user, new tokens!
	return await give_access({ userId: decoded._id });
};

module.exports = {
	all_sessions_GET_service,
	cancel_session_POST_service,
	renew_session_POST_service,
};
