const RandomHelper = require("./../random");

describe("RandomHelper", () => {
	describe("generateRandomNumber()", () => {
		it("should generate a random number between 0 and 999", () => {
			const randomNumber = RandomHelper.generateRandomNumber(3);
			expect(randomNumber).toBeGreaterThanOrEqual(0);
			expect(randomNumber).toBeLessThanOrEqual(999);
		});

		it("should generate a different random number each time", () => {
			const randomNumber1 = RandomHelper.generateRandomNumber(3);
			const randomNumber2 = RandomHelper.generateRandomNumber(3);
			expect(randomNumber1).not.toEqual(randomNumber2);
		});
	});

	describe("generateRandomString()", () => {
		it("should generate a random string of length 10", () => {
			const randomString = RandomHelper.generateRandomString(10);
			expect(randomString).toHaveLength(10);
			expect(randomString).toMatch(/^[0-9a-f]{10}$/);
		});

		it("should generate a different random string each time", () => {
			const randomString1 = RandomHelper.generateRandomString(10);
			const randomString2 = RandomHelper.generateRandomString(10);
			expect(randomString1).not.toEqual(randomString2);
		});
	});
});
