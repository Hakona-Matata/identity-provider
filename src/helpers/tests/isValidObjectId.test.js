const mongoose = require("mongoose");
const isValidObjectId = require("./../isValidObjectId.js");

describe("isValidObjectId", () => {
	test("returns false for empty string", () => {
		expect(isValidObjectId("")).toBe(false);
	});

	test("returns false for invalid object id as string", () => {
		expect(isValidObjectId("1234")).toBe(false);
	});

	test("returns false for object id with wrong length as string", () => {
		expect(isValidObjectId("1234567890123456789012345")).toBe(false);
	});

	test("returns false for null value", () => {
		expect(isValidObjectId(null)).toBe(false);
	});

	test("returns false for undefined value", () => {
		expect(isValidObjectId(undefined)).toBe(false);
	});

	test("returns false for non-string value", () => {
		expect(isValidObjectId(123)).toBe(false);
	});

	test("returns true for valid object id as a mongoose.Types.ObjectId", () => {
		const objectId = mongoose.Types.ObjectId();
		
        expect(isValidObjectId(objectId)).toBe(true);
	});
});
