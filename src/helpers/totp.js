const speakeasy = require("speakeasy");

const generate_secret = async () => {
	const { base32 } = await speakeasy.generateSecret();

	return base32;
};

const verify_totp = async ({ token, secret }) => {
	return speakeasy.totp.verify({
		secret,
		encoding: "base32",
		token,
	});
};

module.exports = { generate_secret, verify_totp };
