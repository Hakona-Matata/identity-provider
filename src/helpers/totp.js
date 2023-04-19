const { authenticator } = require("otplib");

const Encrypter = require("./crypto");
const encrypter = new Encrypter(process.env.TOTP_ENCRYPTION_KEY);

class TotpHelper {
	/* 
		=======================================
			Public methods 
		=======================================
	*/

	static generateTotpCode(secret) {
		return authenticator.generate(secret);
	}

	static generateTotpSecret() {
		const plainTextTotpSecret = authenticator.generateSecret();

		const encryptedTotpSecret = TotpHelper.#encryptTotpSecret(plainTextTotpSecret);

		return { plainTextTotpSecret, encryptedTotpSecret };
	}

	static verifyTotpCode(token, secret) {
		const decryptedTotpSecret = TotpHelper.#decryptTotpSecret(secret);

		return authenticator.verify({ token, secret: decryptedTotpSecret });
	}

	/* 
		=======================================
			Private methods 
		=======================================
	*/

	static #encryptTotpSecret(plainTextTotpSecret) {
		return encrypter.encrypt(plainTextTotpSecret);
	}

	static #decryptTotpSecret(encryptedTotpSecret) {
		return encrypter.dencrypt(encryptedTotpSecret);
	}
}

module.exports = TotpHelper;
