const bcrypt = require("bcrypt");

class HashHelper {
	static async generate({ plainText }) {
		return await bcrypt.hash(plainText, 12);
	}

	static async verify({ plainText, hash }) {
		return await bcrypt.compare(plainText, hash);
	}
}

module.exports = HashHelper;
