const crypto = require("crypto");

class Encrypter {
	static algorithm = "aes-192-cbc";
	static salt = "salt";

	static encrypt(clearText, key) {
		if (!key || typeof key !== "string") {
			throw new Error("Invalid key");
		}
		const encryptedKey = crypto.scryptSync(key, Encrypter.salt, 24);
		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv(Encrypter.algorithm, encryptedKey, iv);
		const encrypted = cipher.update(clearText, "utf8", "hex");

		return [encrypted + cipher.final("hex"), Buffer.from(iv).toString("hex")].join("|");
	}

	static decrypt(encryptedText, key) {
		if (!key) {
			throw new Error("Key is undefined");
		}

		const encryptedKey = crypto.scryptSync(key, Encrypter.salt, 24);

		const [encrypted, iv] = encryptedText && encryptedText.split("|");

		if (!iv || iv.length !== 32) {
			throw new Error("Invalid IV");
		}

		const decipher = crypto.createDecipheriv(Encrypter.algorithm, encryptedKey, Buffer.from(iv, "hex"));

		try {
			const decrypted = decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
			return decrypted;
		} catch (error) {
			throw new Error("Bad decrypt");
		}
	}
}

module.exports = Encrypter;
