class RandomHelper {
	static generateRandomNumber(length) {
		const min = Math.pow(10, length - 1); // The maximum possible value
		const max = Math.pow(10, length) - 1; // The minmum possible value

		const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

		return randomNumber;
	}
}

module.exports = RandomHelper;
