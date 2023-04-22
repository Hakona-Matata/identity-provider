const Joi = require("joi");
const validate = require("./../validate");

describe("validate", () => {
	describe("when given a valid object", () => {
		const schema = Joi.object({
			name: Joi.string().required(),
			age: Joi.number().integer().min(0).max(120).required(),
			email: Joi.string().email().required(),
		});

		const validObject = {
			name: "John Doe",
			age: 30,
			email: "johndoe@example.com",
		};

		it("does not throw an error", async () => {
			await expect(validate(schema, validObject)).resolves.not.toThrow();
		});
	});

	describe("when given an invalid object", () => {
		const schema = Joi.object({
			name: Joi.string().required(),
			age: Joi.number().integer().min(0).max(120).required(),
			email: Joi.string().email().required(),
		});

		it("throws a validation error", async () => {
			const invalidObject = {
				name: "John Doe",
				age: "30", // should be a number, not a string
				email: "invalid-email", // should be a valid email
			};

			await expect(validate(schema, invalidObject)).rejects.toThrowError(Joi.ValidationError);
		});

		it("throws an error with all validation errors", async () => {
			const invalidObject = {
				name: "", // missing required name field
				age: 30,
				email: "invalid-email", // should be a valid email
			};

			const expectedError = new Joi.ValidationError(`"name" is not allowed to be empty. "email" must be a valid email`);

			await expect(validate(schema, invalidObject)).rejects.toEqual(expectedError);
		});
	});
});
