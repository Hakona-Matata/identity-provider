const isValidObjectId = require("./../isValidObjectId");
const mongoose = require("mongoose");

describe("isValidObjectId", () => {
	it("returns true for a valid ObjectId string", () => {
		const objectId = mongoose.Types.ObjectId().toHexString();
		expect(isValidObjectId(objectId)).toBe(true);
	});

	it("returns false for an invalid string", () => {
		const invalidObjectId = "invalid";
		expect(isValidObjectId(invalidObjectId)).toBe(false);
	});

	it("returns true for a valid ObjectId object", () => {
		const objectId = mongoose.Types.ObjectId();
		expect(isValidObjectId(objectId)).toBe(true);
	});

	it("returns false for null or undefined input", () => {
		expect(isValidObjectId(null)).toBe(false);
		expect(isValidObjectId(undefined)).toBe(false);
	});

	it("returns false for other types of input", () => {
		expect(isValidObjectId(123)).toBe(false);
		expect(isValidObjectId({})).toBe(false);
		expect(isValidObjectId([])).toBe(false);
		expect(isValidObjectId(true)).toBe(false);
	});
});
