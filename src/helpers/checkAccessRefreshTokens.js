const { verify_token } = require("./token");
const Session = require("./../app/Models/Session.model");
const jwt_errors = require("./../Errors/jwt");

module.exports = async = async ({ req, res }) => {
	/* 
        if refresh token is given by "protect" middleware, then that means 
        the access token is invalid and I need to use that refresh token 
        to create new (access and refresh tokens), right?

        At the end, return userId, refreshToken to be used in the next middlewares
    */
	if (req.body.refreshToken) {
		const { userId, refreshToken } = await check_refreshToken({
			token: req.body.refreshToken,
			secret: process.env.REFRESH_TOKEN_SECRET,
			res,
		});

		return { userId, refreshToken };
	}

	/*
        If access token is given, then that means i need to consume a private resource
        and just validate it and return the result!
    */

	const { userId, accessToken } = await check_accessToken({
		token: req.headers["authorization"].split(" ")[1],
		secret: process.env.ACCESS_TOKEN_SECRET,
		res,
	});

	return { userId, accessToken };
};

const check_accessToken = async ({ token, secret, res }) => {
	try {
		if (!token) {
			throw new Error("sorry, the access token is not found!");
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
			throw new Error("Sorry, this access token is revoked!");
		}

		return {
			userId: decoded._id,
			accessToken: token,
		};
	} catch (error) {
		console.log(error);
		console.log("from access token check");
		error.token = "access token";

		return jwt_errors({ res, error });
	}
};

const check_refreshToken = async ({ token, secret, res }) => {
	try {
		if (!token) {
			throw new Error("sorry, the refresh token is not found!");
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
	} catch (error) {
		console.log("from resfresh token check");
		error.token = "refresh token";

		return jwt_errors({ res, error });
	}
};
