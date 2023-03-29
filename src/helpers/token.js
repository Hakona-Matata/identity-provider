const jwt = require("jsonwebtoken");

const generate_token = async ({ payload, secret, expiresIn }) => {
	return await jwt.sign(payload, secret, { expiresIn });
};

const verify_token = async ({ token, secret }) => {
	return await jwt.verify(token, secret);
};

module.exports = {
	generate_token,
	verify_token,
};
