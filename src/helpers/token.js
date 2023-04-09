const jwt = require("jsonwebtoken");

const generateToken = async ({ payload, secret, expiresIn }) => {
	return await jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = async ({ token, secret }) => {
	return await jwt.verify(token, secret);
};

class TokenHelper {
	static async generateVerificationToken(payload) {
		return await generateToken({
			payload,
			secret: process.env.VERIFICATION_TOKEN_SECRET,
			expiresIn: process.env.VERIFICATION_TOKEN_EXPIRES_IN,
		});
	}

	static async verifyVerificationToken(verificationToken) {
		return await verifyToken({
			token: verificationToken,
			secret: process.env.VERIFICATION_TOKEN_SECRET,
		});
	}
}

module.exports = TokenHelper;
