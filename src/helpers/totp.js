const Encrypter = require("./encryptor");
const { authenticator } = require("otplib");

class TotpHelper {


	constructor() {
		this.#encrypter = new Encrypter(process.env.TOTP_ENCRYPTION_KEY);
	}
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
		// return this.#encryptTotpSecret.encrypt()  encrypter.encrypt(plainTextTotpSecret);
	}

	static #decryptTotpSecret(encryptedTotpSecret) {
		return encrypter.decrypt(encryptedTotpSecret);
	}
}

module.exports = TotpHelper;
