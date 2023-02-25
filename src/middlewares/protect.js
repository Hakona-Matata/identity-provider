const check_access_refresh_tokens = require("./../helpers/checkAccessRefreshTokens");
const jwt_errors = require("../Errors/jwt");

module.exports = async (req, res, next) => {
	try {
		const { userId, accessToken, refreshToken } =
			await check_access_refresh_tokens({ req, res });
		console.log("=====================");
		console.log({ userId, accessToken, refreshToken });
		console.log("=====================");

		req.userId = userId;
		req.accessToken = accessToken;
		req.refreshToken = refreshToken;

		next();
	} catch (error) {
		return error.name === "Error"
			? res.status(401).json({
					data: error.message,
			  })
			: jwt_errors({ res, error });
	}
};
