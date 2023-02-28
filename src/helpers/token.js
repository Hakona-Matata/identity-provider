const jwt = require("jsonwebtoken");

// For General use!
const generate_token = async ({ payload, secret, expiresIn }) => {
	return await jwt.sign(payload, secret, { expiresIn });
};

const verify_token = async ({ token, secret }) => {
	return await jwt.verify(token, secret);
};

// Specific use!
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

module.exports = {
	generate_token,
	verify_token,
	generate_access_refresh_token,
};
