const speakeasy = require("speakeasy");

const generate_secret = async () => {
	const { base32 } = await speakeasy.generateSecret();

	return base32;
};

module.exports = { generate_secret };
