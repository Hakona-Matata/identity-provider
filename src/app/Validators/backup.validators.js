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
			}),
	}),
};
