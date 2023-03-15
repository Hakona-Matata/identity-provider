const check_access_refresh_tokens = require("./../helpers/checkAccessRefreshTokens");
const jwt_errors = require("../Errors/jwt");

/*
	This middleware checks the validity of tokens:
	- access token
	- refresh token (if provided) to get new (access and refresh) tokens
*/

module.exports = async (req, res, next) => {
	const accessToken = req?.headers["authorization"]?.split(" ")[1];
	const refreshToken = req.body.refreshToken;

	try {
		if (!accessToken && !refreshToken) {
			return res
				.status(401)
				.json({ data: "Sorry, you need to pass the needed tokens!" });
		}

		const result = await check_access_refresh_tokens({ req, res });

		if (refreshToken) {
			req.userId = result.userId;
			req.refreshToken = result.refreshToken;
			return next();
		}

		req.userId = result.userId;
		req.accessToken = result.accessToken;
		return next();
	} catch (error) {
		// console.log(error);
		return jwt_errors({ res, error });
	}
};
