const Joi = require("joi");

module.exports = {
	confirm: Joi.object({
		code: Joi.number()
			.integer()
			.positive()
			.required()
			.min(100_000_000_000)
			.max(999_999_999_999)
			.messages({
				"any.required": `"code" field is required!`,
				"number.base": `"code" field has to be of type number!`,
				"number.integer": `"code" field has to be integer!`,
				"number.positive": `"code" field has to be positive!`,
				"number.min": `"code" field has to be 12 digits!`,
				"number.max": `"code" field has to be 12 digits!`,
				"number.unsafe": `"code" field has to be 12 digits!`,
			}),
	}),

	verify: Joi.object({
		email: Joi.string().trim().min(15).max(40).email().required().messages({
			"string.base": `"email" field has to be of type string!`,
			"string.email": `"email" field has to be a valid email!`,
			"string.empty": `"email" field can't be empty!`,
			"string.min": `"email" field can't be less than 15 characters!`,
			"string.max": `"email" field can't be more than 40 characers!`,
			"any.required": `"email" field is required!`,
		}),
		code: Joi.number()
			.integer()
			.positive()
			.required()
			.min(100_000_000_000)
			.max(999_999_999_999)
			.messages({
				"any.required": `"code" field is required!`,
				"number.base": `"code" field has to be of type number!`,
				"number.integer": `"code" field has to be integer!`,
				"number.positive": `"code" field has to be positive!`,
				"number.min": `"code" field has to be 12 digits!`,
				"number.max": `"code" field has to be 12 digits!`,
			}),
	}),
};
