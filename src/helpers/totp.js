require("dotenv").config();
const Encrypter = require("./encryptor");
const { authenticator } = require("otplib");

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
		return Encrypter.encrypt(plainTextTotpSecret, process.env.TOTP_ENCRYPTION_KEY);
	}

	static #decryptTotpSecret(encryptedTotpSecret) {
		return Encrypter.decrypt(encryptedTotpSecret, process.env.TOTP_ENCRYPTION_KEY);
	}
}

module.exports = TotpHelper;
