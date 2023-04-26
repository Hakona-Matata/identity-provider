const TotpHelper = require("./../totp");
const Encrypter = require("../encryptor");

describe("TotpHelper", () => {
	describe("#generateTotpCode", () => {
		it("returns a 6-digit number", async () => {
			const code = await TotpHelper.generateTotpCode("This is my secret");

			expect(code).toBeDefined();
			expect(typeof code).toBe("string");
			expect(code.toString().length).toBe(6);
		});

		it("returns the same code when called twice with the same secret within the time range", async () => {
			const secret = "This is my secret";
			const code1 = await TotpHelper.generateTotpCode(secret);
			const code2 = await TotpHelper.generateTotpCode(secret);
			expect(code1).toBe(code2);
		});

		if (process.env.NODE_ENV === "production") {
			it("returns different codes when called twice with the same secret outside the time range", async () => {
				const secret = "This is my secret";
				const code1 = await TotpHelper.generateTotpCode(secret);

				// Wait for 1 minute
				await new Promise((resolve) => setTimeout(resolve, 60 * 1000));

				const code2 = await TotpHelper.generateTotpCode(secret);

				expect(code1).not.toBe(code2);
			});
		}
	});

	describe("#generateTotpSecret", () => {
		it("should generate a plain text secret and an encrypted secret", async () => {
			const totpSecret = await TotpHelper.generateTotpSecret();

			expect(typeof totpSecret.plainTextTotpSecret).toBe("string");
			expect(totpSecret.plainTextTotpSecret).toHaveLength(16);

			expect(typeof totpSecret.encryptedTotpSecret).toBe("string");
			expect(totpSecret.encryptedTotpSecret).toHaveLength(97);

			const decryptedSecret = Encrypter.decrypt(totpSecret.encryptedTotpSecret, process.env.TOTP_ENCRYPTION_KEY);

			expect(decryptedSecret).toBe(totpSecret.plainTextTotpSecret);
		});

		it("should return a different plain text and encrypted secret every time it's called", async () => {
			const result1 = await TotpHelper.generateTotpSecret();
			const result2 = await TotpHelper.generateTotpSecret();

			expect(result1.plainTextTotpSecret).not.toBe(result2.plainTextTotpSecret);
			expect(result1.encryptedTotpSecret).not.toBe(result2.encryptedTotpSecret);
		});
	});

	describe("#verifyTotpCode", () => {
		const secretObj = TotpHelper.generateTotpSecret();
		const token = TotpHelper.generateTotpCode(secretObj.plainTextTotpSecret);
		const encryptedSecret = secretObj.encryptedTotpSecret;

		it("returns true for a valid TOTP code", async () => {
			const isValid = TotpHelper.verifyTotpCode(token, encryptedSecret);
			expect(isValid).toBe(true);
		});

		it("returns false for an invalid TOTP code", async () => {
			const invalidToken = "123456";
			const isValid = TotpHelper.verifyTotpCode(invalidToken, encryptedSecret);
			expect(isValid).toBe(false);
		});

		it("returns false for a null token", async () => {
			const isValid = TotpHelper.verifyTotpCode(null, encryptedSecret);
			expect(isValid).toBe(false);
		});
	});
});
