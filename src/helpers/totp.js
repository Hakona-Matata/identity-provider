const { totp } = require("otplib");

const generate_totp = ({ secret }) => {
	return totp.generate(secret);
};

const verify_totp = async ({ token, secret }) => {
	return totp.verify({ token, secret });
};

module.exports = { generate_totp, verify_totp };
