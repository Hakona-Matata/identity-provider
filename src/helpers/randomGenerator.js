/**
 * A utility class for generating random numbers and strings
 * @class
 */
const { randomBytes } = require("crypto");

class RandomHelper {
	/**
	 * Generates a random number within the specified length range
	 * @static
	 * @param {number} length - The length of the desired random number
	 * @returns {number} - A random number with the specified length
	 */
	static generateRandomNumber(length) {
		const min = Math.pow(10, length - 1); // The maximum possible value
		const max = Math.pow(10, length) - 1; // The minimum possible value

		const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

		return randomNumber;
	}

	/**
	 * Generates a random string of the specified length
	 * @static
	 * @param {number} length - The length of the desired random string
	 * @returns {string} - A random string with the specified length
	 */
	static generateRandomString(length) {
		const bytes = Math.ceil(length / 2);
		const randomBuffer = randomBytes(bytes);

		return randomBuffer.toString("hex").slice(0, length);
	}
}

module.exports = RandomHelper;
