const check_access_refresh_tokens = require("./../helpers/checkAccessRefreshTokens");
const jwt_errors = require("../Errors/jwt");

module.exports = async (req, res, next) => {
	try {
		const result = await check_access_refresh_tokens({ req, res });
		console.log({ result });
		if (req.body.refreshToken) {
			req.userId = result.userId;
			req.refreshToken = result.refreshToken;
			next();
		}

		req.userId = result.userId;
		req.accessToken = result.accessToken;
		next();
	} catch (error) {
		console.log(error);
		return jwt_errors({ res, error });
	}
};
