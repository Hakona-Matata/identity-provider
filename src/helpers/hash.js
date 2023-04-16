const bcrypt = require("bcrypt");

class HashHelper {
	static async generate(plainText) {
		return await bcrypt.hash(plainText.toString(), 12);
	}

	static async verify(plainText, hash) {
		return await bcrypt.compare(plainText.toString(), hash.toString());
	}
}

module.exports = HashHelper;
