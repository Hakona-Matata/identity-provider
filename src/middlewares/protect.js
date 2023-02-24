const { CustomError } = require("./../Errors/CustomError");
const { verify_token } = require("./../helpers/token");

//=========================================================
module.exports = async (req, res, next) => {
	// (1) Get access token
	const { accessToken } = req.body;

	if (!accessToken) {
		throw new CustomError("UnAuthorized", "accessToken is not found");
	}

	const decoded = await verify_token({
		token: accessToken,
		secret: process.env.ACCESS_TOKEN_SECRET,
	});

	if (!decoded) {
		throw new CustomError(
			"UnAuthorized",
			"Sorry, your access token is invalid"
		);
	}

	// now, we can access it in any protected route!
	req.userId = decoded._id;

	// For revoking it whenever the user wants!
	req.accessToken = accessToken;

	next();
};
