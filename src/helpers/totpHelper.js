const Encryptor = require("./encryptor");
const { authenticator } = require("otplib");

/**
 * A helper class to generate, verify TOTP codes and encrypt/decrypt TOTP secrets.
 *
 * @class
 */
class TotpHelper {
	/**
	 * Generate a TOTP code using the given secret.
	 *
	 * @param {string} secret - The TOTP secret to generate the code with.
	 * @returns {string} The TOTP code.
	 */

	static generateTotpCode(secret) {
		return authenticator.generate(secret);
	}

	/**
	 * Generate a TOTP secret and encrypt it.
	 *
	 * @returns {Object} An object containing the plain text and encrypted TOTP secrets.
	 */
	static generateTotpSecret() {
		const plainTextTotpSecret = authenticator.generateSecret();

		const encryptedTotpSecret = TotpHelper.#encryptTotpSecret(plainTextTotpSecret);

		return { plainTextTotpSecret, encryptedTotpSecret };
	}

	/**
	 * Verify if the given TOTP code is valid for the provided secret.
	 *
	 * @param {string} token - The TOTP code to verify.
	 * @param {string} secret - The TOTP secret to verify the code with.
	 * @returns {boolean} `true` if the code is valid, `false` otherwise.
	 */
	static verifyTotpCode(token, secret) {
		const decryptedTotpSecret = TotpHelper.#decryptTotpSecret(secret);

		return authenticator.verify({ token, secret: decryptedTotpSecret });
	}

	/**
	 * Encrypt the given plain text TOTP secret using the TOTP encryption key.
	 *
	 * @private
	 * @param {string} plainTextTotpSecret - The plain text TOTP secret to encrypt.
	 * @returns {string} The encrypted TOTP secret.
	 */
	static #encryptTotpSecret(plainTextTotpSecret) {
		return Encryptor.encrypt(plainTextTotpSecret, process.env.TOTP_ENCRYPTION_KEY);
	}

	/**
	 * Decrypt the given encrypted TOTP secret using the TOTP encryption key.
	 *
	 * @private
	 * @param {string} encryptedTotpSecret - The encrypted TOTP secret to decrypt.
	 * @returns {string} The decrypted TOTP secret.
	 */
	static #decryptTotpSecret(encryptedTotpSecret) {
		return Encryptor.decrypt(encryptedTotpSecret, process.env.TOTP_ENCRYPTION_KEY);
	}
}

module.exports = TotpHelper;
