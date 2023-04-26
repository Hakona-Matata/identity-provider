const bcrypt = require("bcrypt");
const HashHelper = require("./../hash");

jest.mock("bcrypt");

describe("HashHelper", () => {
	describe("generate method", () => {
		it("calls bcrypt.hash() with the plaintext and salt rounds", async () => {
			const plainText = "password";
			const saltRounds = 10;

			await HashHelper.generate(plainText, saltRounds);

			expect(bcrypt.hash).toHaveBeenCalledWith(plainText, saltRounds);
		});

		it("calls bcrypt.hash with default salt rounds if not provided", async () => {
			const plainText = "password";

			await HashHelper.generate(plainText);

			expect(bcrypt.hash).toHaveBeenCalledWith(plainText, 12);
		});

		it("returns the result of bcrypt.hash", async () => {
			const plainText = "password";
			const hash = "hashed-password";

			bcrypt.hash.mockResolvedValue(hash);

			const result = await HashHelper.generate(plainText);

			expect(result).toEqual(hash);
		});
	});

	describe("verify method", () => {
		it("calls bcrypt.compare with the plaintext and hash", async () => {
			const plainText = "password";
			const hash = "hashed-password";

			await HashHelper.verify(plainText, hash);

			expect(bcrypt.compare).toHaveBeenCalledWith(plainText, hash);
		});

		it("returns the result of bcrypt.compare", async () => {
			const plainText = "password";
			const hash = "hashed-password";
			const result = true;

			bcrypt.compare.mockResolvedValue(result);

			const verifyResult = await HashHelper.verify(plainText, hash);

			expect(verifyResult).toEqual(result);
		});
	});
});
