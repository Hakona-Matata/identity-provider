const DateConvertor = require("./../dateConvertor");

describe("DateConvertor", () => {
	describe("dateToDaysHoursMinutes", () => {
		test("returns 0 days, 0 hours, 0 minutes for expired date", () => {
			const result = DateConvertor.dateToDaysHoursMinutes("2020-01-01T00:00:00.000Z", 0);

			expect(result).toEqual({ days: 0, hours: 0, minutes: 0 });
		});

		test("returns correct output for future dates", () => {
			const result = DateConvertor.dateToDaysHoursMinutes("2023-05-01T12:00:00.000Z", 86400);

			expect(result).toEqual({ days: 10, hours: 6, minutes: 20 });
		});

		test("returns correct output for past dates", () => {
			const result = DateConvertor.dateToDaysHoursMinutes("2022-04-01T00:00:00.000Z", 86400);

			expect(result).toEqual({ days: 0, hours: 0, minutes: 0 });
		});

		test("returns correct output for current date", () => {
			const result = DateConvertor.dateToDaysHoursMinutes(new Date().toISOString(), 0);

			expect(result).toEqual({ days: 0, hours: 0, minutes: 0 });
		});

		test("returns correct output for negative expiresAfterSeconds", () => {
			const result = DateConvertor.dateToDaysHoursMinutes(new Date().toISOString(), -86400);

			expect(result).toEqual({ days: 0, hours: 0, minutes: 0 });
		});
	});
});
