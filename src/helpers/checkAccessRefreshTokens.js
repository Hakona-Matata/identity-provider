const { verify_token } = require("./token");
const Session = require("./../app/Models/Session.model");

module.exports = async = async ({ req, res }) => {
	/* 
                                  (1)
        if refresh token is given by "protect" middleware, then that means 
        the access token is invalid and I need to use that refresh token 
        to create new (access and refresh) tokens

        At the end, return userId, refreshToken to be used in the next middlewares!
    */
	if (req.body.refreshToken) {
		const result = await check_refreshToken({
			token: req.body.refreshToken,
			secret: process.env.REFRESH_TOKEN_SECRET,
			res,
		});

		return { userId: result.userId, refreshToken: result.refreshToken };
	}

	/*
                                    (2)
        If access token is given, then that means i need to consume a private resource
        and just validate it and return userId, accessToken
    */

	const result = await check_accessToken({
		token: req?.headers["authorization"]?.split(" ")[1],
		secret: process.env.ACCESS_TOKEN_SECRET,
		res,
	});

	return { userId: result.userId, accessToken: result.accessToken };
};

const check_accessToken = async ({ token, secret, res }) => {
	if (!token) {
		return res
			.status(400)
			.json({ data: "sorry, the access token is not found!" });
	}

	// (2) Verify access token
	const decoded = await verify_token({
		token,
		secret,
	});

	// (3) Get session from DB
	const session = await Session.findOne({
		userId: decoded._id,
		accessToken: token,
	});

	// * This means that access token is not expired! not manipulated! (only there is a window to use it!)
	if (!session) {
		return res
			.status(401)
			.json({ data: "Sorry, this access token is invalid!" });
	}

	return {
		userId: decoded._id,
		accessToken: token,
	};
};

const check_refreshToken = async ({ token, secret, res }) => {
	if (!token) {
		return res
			.status(400)
			.json({ data: "sorry, the refresh token is not found!" });
	}

	// (2) Verify refresh token
	const decoded = await verify_token({
		token,
		secret,
	});

	return {
		userId: decoded._id,
		refreshToken: token,
	};
};
