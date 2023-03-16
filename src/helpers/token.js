const jwt = require("jsonwebtoken");
const Session = require("./../app/Models/Session.model");
const CustomError = require("./../Errors/CustomError");

const generate_token = async ({ payload, secret, expiresIn }) => {
	return await jwt.sign(payload, secret, { expiresIn });
};

const verify_token = async ({ token, secret }) => {
	return await jwt.verify(token, secret);
};

const give_access = async ({ userId }) => {
	// (1) Prepare payload
	const payload = { _id: userId };

	// (2) Create access and refresh tokens
	const { accessToken, refreshToken } = await generate_access_refresh_token({
		accessTokenPayload: payload,
		refreshTokenPayload: payload,
	});

	// (3) create and save session
	const done = await Session.create({
		userId,
		accessToken,
		refreshToken,
	});

	if (!done) {
		throw new CustomError("ProcessFailed", "Sorry, the login attempt failed");
	}

	// (4) Create and return access token
	return {
		accessToken,
		refreshToken,
	};
};

module.exports = {
	generate_token,
	verify_token,
	give_access,
};

// ===================================================

const generate_access_refresh_token = async ({
	accessTokenPayload,
	refreshTokenPayload,
}) => {
	const accessToken = await generate_token({
		payload: accessTokenPayload,
		secret: process.env.ACCESS_TOKEN_SECRET,
		expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
	});

	const refreshToken = await generate_token({
		payload: refreshTokenPayload,
		secret: process.env.REFRESH_TOKEN_SECRET,
		expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
	});

	return {
		accessToken,
		refreshToken,
	};
};
