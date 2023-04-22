const Encrypter = require("./../crypto");

describe("Encrypter", () => {
	const encryptionKey = "my_secret_key";
	const clearText = "Hello, world!";
	let encrypter;

	beforeEach(() => {
		encrypter = new Encrypter(encryptionKey);
	});

	describe("encrypt()", () => {
		test("should return a string with two parts separated by '|'", () => {
			const encryptedText = encrypter.encrypt(clearText);

			expect(typeof encryptedText).toBe("string");
			expect(encryptedText.split("|").length).toBe(2);
		});

		test("should return a different result for each encryption", () => {
			const encryptedText1 = encrypter.encrypt(clearText);
			const encryptedText2 = encrypter.encrypt(clearText);

			expect(encryptedText1).not.toBe(encryptedText2);
		});

		test("should be able to decrypt the encrypted text", () => {
			const encryptedText = encrypter.encrypt(clearText);
			const decryptedText = encrypter.decrypt(encryptedText);

			expect(decryptedText).toBe(clearText);
		});
	});

	describe("dencrypt()", () => {
		test("should throw an error if the IV is missing", () => {
			expect(() => encrypter.decrypt("encrypted_text")).toThrow("IV not found");
		});

		test("should throw an error if the encrypted text is invalid", () => {
			const invalidEncryptedText = "invalid_text|iv";

			expect(() => encrypter.decrypt(invalidEncryptedText)).toThrow();
		});

		test("should be able to decrypt the encrypted text", () => {
			const encryptedText = encrypter.encrypt(clearText);
			const decryptedText = encrypter.decrypt(encryptedText);

			expect(decryptedText).toBe(clearText);
		});
	});
});
