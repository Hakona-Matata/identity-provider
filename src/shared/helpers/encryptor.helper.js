const crypto = require("crypto");

/**
 * A utility class for encrypting and decrypting text using the AES-192-CBC algorithm.
 *
 * @class
 */
class Encryptor {
	/**
	 * The encryption algorithm used by this class.
	 */
	static algorithm = "aes-192-cbc";

	/**
	 * The salt used for deriving the encryption key.
	 */
	static salt = "salt";

	/**
	 * Encrypts the given plaintext using the given key.
	 *
	 * @param {string} clearText - The plaintext to encrypt.
	 * @param {string} key - The encryption key.
	 * @returns {string} The encrypted text, encoded in hexadecimal format and separated from the initialization vector (IV) by a pipe character.
	 * @throws {Error} If the key is not a string or is undefined.
	 */
	static encrypt(clearText, key) {
		if (!key || typeof key !== "string") {
			throw new Error("Invalid key");
		}
		const encryptedKey = crypto.scryptSync(key, Encryptor.salt, 24);
		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv(Encryptor.algorithm, encryptedKey, iv);
		const encrypted = cipher.update(clearText, "utf8", "hex");

		return [encrypted + cipher.final("hex"), Buffer.from(iv).toString("hex")].join("|");
	}

	/**
	 * Decrypts the given ciphertext using the given key.
	 *
	 * @param {string} encryptedText - The ciphertext to decrypt, in the format produced by the `encrypt()` method.
	 * @param {string} key - The decryption key.
	 * @returns {string} The decrypted plaintext.
	 * @throws {Error} If the key is undefined, the IV is missing or has an invalid length, or the decryption fails.
	 */
	static decrypt(encryptedText, key) {
		if (!key) {
			throw new Error("Key is undefined");
		}

		const encryptedKey = crypto.scryptSync(key, Encryptor.salt, 24);

		const [encrypted, iv] = encryptedText && encryptedText.split("|");

		if (!iv || iv.length !== 32) {
			throw new Error("Invalid IV");
		}

		const decipher = crypto.createDecipheriv(Encryptor.algorithm, encryptedKey, Buffer.from(iv, "hex"));

		try {
			const decrypted = decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
			return decrypted;
		} catch (error) {
			throw new Error("Bad decrypt");
		}
	}
}

module.exports = Encryptor;
