const Session = require("./../Models/Session.model");
const {
	verify_token,
	generate_access_refresh_token,
} = require("./../../helpers/token");
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

const renew_session_POST_service = async ({ userId, givenRefreshToken }) => {
	// (1) Prepare tokens payload!
	const payload = {
		_id: userId,
	};

	// (2) Generate access & refresh tokens!
	const { accessToken, refreshToken } = await generate_access_refresh_token({
		accessTokenPayload: payload,
		refreshTokenPayload: payload,
	});

	// (3) Delete old tokens from DB
	const deletedSession = await Session.findOneAndDelete({
		refreshToken: givenRefreshToken,
	});

	// (4) Save new tokens into DB
	const result = await Session.create({
		userId: deletedSession.userId,
		accessToken,
		refreshToken,
	});

	// (5) Return user, new tokens!
	return { accessToken, refreshToken };
};

module.exports = {
	all_sessions_GET_service,
	cancel_session_POST_service,
	renew_session_POST_service,
};
