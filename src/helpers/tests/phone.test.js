const PhoneHelper = require("./../phone");

describe("PhoneHelper", () => {
	describe("validatePhone", () => {
		it("should return expected result for valid phone number", () => {
			const result = PhoneHelper.validatePhone("+201212121212");

			expect(result).toEqual({
				isValid: true,
				phone: "+201212121212",
				country: {
					name: "Egypt",
					iso2: "EG",
					code: "+20",
				},
			});
		});

		it("should return error object for invalid phone number", () => {
			const result = PhoneHelper.validatePhone("+111111111111111");

			expect(result).toEqual({ isValid: false });
		});

		it("should return error object for undefined phone number", () => {
			const result = PhoneHelper.validatePhone(undefined);

			expect(result).toEqual({ isValid: false });
		});
	});
});
