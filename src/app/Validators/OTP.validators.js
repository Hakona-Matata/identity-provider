const Joi = require("joi");

module.exports = {
	confirmOTP: Joi.object({
		otp: Joi.number()
			.integer()
			.positive()
			.required()
			.min(100_000)
			.max(900_1000)
			.messages({
				"any.required": `"otp" field is required!`,
				"number.base": `"otp" field has to be of type number!`,
				"number.integer": `"otp" field has to be integer!`,
				"number.positive": `"otp" field has to be positive!`,
				"number.min": `"otp" field has to be 6 digits!`,
				"number.max": `"otp" field has to be 6 digits!`,
			}),
	}),
};
