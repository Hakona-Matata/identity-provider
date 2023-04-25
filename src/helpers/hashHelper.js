const bcrypt = require("bcrypt");

class HashHelper {
	static async generate(plainText, saltRounds = 12) {
		return await bcrypt.hash(`${plainText}`, saltRounds);
	}

	static async verify(plainText, hash) {
		return await bcrypt.compare(`${plainText}`, hash);
	}
}

module.exports = HashHelper;
