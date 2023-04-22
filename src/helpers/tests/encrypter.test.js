const Encrypter = require("./../encryptor");

describe("Encrypter", () => {
	const key = "this is my encyption key";
	const clearText = "this is a clear text";

	describe("encrypt", () => {
		it("should encrypt the text", () => {
			const encryptedText = Encrypter.encrypt(clearText, key);
			expect(encryptedText).not.toBe(clearText);
		});

		it("should return a string with the format encryptedText|iv", () => {
			const encryptedText = Encrypter.encrypt(clearText, key);
			expect(encryptedText).toMatch(/^[0-9a-f]+\|[0-9a-f]+$/);
		});
	});

	describe("decrypt", () => {
		test("should decrypt a valid encrypted text", () => {
			const encryptedText = Encrypter.encrypt(clearText, key);
			const decryptedText = Encrypter.decrypt(encryptedText, key);
			expect(decryptedText).toBe(clearText);
		});

		test("should throw an error if the encrypted text is invalid", () => {
			const invalidEncryptedText = "invalid-encrypted-text";
			expect(() => {
				Encrypter.decrypt(invalidEncryptedText, key);
			}).toThrow("Invalid IV");
		});

		test("should throw an error if the encrypted text is corrupted", () => {
			expect(() => {
				const encryptedText = Encrypter.encrypt("this is a secret", key);
				const corruptedText = encryptedText.replace(/[0-9a-f]/, "x");
				Encrypter.decrypt(corruptedText, key);
			}).toThrow("Bad decrypt");
		});
	});
});
