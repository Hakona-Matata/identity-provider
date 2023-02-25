const Session = require("./../Models/Session.model");
const { verify_token } = require("./../../helpers/token");

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

	// (3) Sort and return sessions (valid, invalid)
	return {
		count: sessions.length,
		sessions: sessionWithStatus.sort(
			(a, b) => Number(b.isValid) - Number(a.isValid)
		),
	};
};

module.exports = { all_sessions_GET_service };
