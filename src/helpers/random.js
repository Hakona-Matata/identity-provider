const { randomBytes } = require("crypto");

class RandomHelper {
	static generateRandomNumber(length) {
		const min = Math.pow(10, length - 1); // The maximum possible value
		const max = Math.pow(10, length) - 1; // The minmum possible value

		const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

		return randomNumber;
	}

	static generateRandomString(length) {
		const bytes = Math.ceil(length / 2);
		const randomBuffer = randomBytes(bytes);

		return randomBuffer.toString("hex").slice(0, length);
	}
}

module.exports = RandomHelper;
