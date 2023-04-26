const bcrypt = require("bcrypt");

/**
 * A utility class for generating and verifying bcrypt hashes.
 * @class
 */
class HashHelper {
	/**
	 * Generates a bcrypt hash for the given plaintext string.
	 * @static
	 * @async
	 * @param {string} plainText - The plaintext string to hash.
	 * @param {number} [saltRounds=12] - The number of salt rounds to use (default is 12).
	 * @returns {Promise<string>} A promise that resolves to the bcrypt hash string.
	 * @throws {Error} If the plainText parameter is not a string.
	 */
	static async generate(plainText, saltRounds = 12) {
		if (typeof plainText !== "string") {
			throw new Error("Plain text must be a string");
		}

		return await bcrypt.hash(plainText, saltRounds);
	}

	/**
	 * Verifies that the given plaintext string matches the given bcrypt hash.
	 * @static
	 * @async
	 * @param {string} plainText - The plaintext string to verify.
	 * @param {string} hash - The bcrypt hash string to verify against.
	 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the plaintext matches the hash.
	 * @throws {Error} If either the plainText or hash parameters are not strings.
	 */
	static async verify(plainText, hash) {
		if (typeof plainText !== "string") {
			throw new Error("Plain text must be a string");
		}

		if (typeof hash !== "string") {
			throw new Error("Hash must be a string");
		}

		return await bcrypt.compare(plainText, hash);
	}
}

module.exports = HashHelper;
