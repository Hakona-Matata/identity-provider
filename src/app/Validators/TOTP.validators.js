const Joi = require("joi");

module.exports = {
	confirmTOTP: Joi.object({
		totp: Joi.number()
			.integer()
			.positive()
			.required()
			.min(100_000)
			.max(900_1000)
			.messages({
				"any.required": `"totp" field is required!`,
				"number.base": `"totp" field has to be of type number!`,
				"number.integer": `"totp" field has to be integer!`,
				"number.positive": `"totp" field has to be positive!`,
				"number.min": `"totp" field has to be 6 digits!`,
				"number.max": `"totp" field has to be 6 digits!`,
			}),
	}),
};
