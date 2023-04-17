const Joi = require("joi");
const isValidId = require("./../../helpers/isValidObjectId");

module.exports = {
	cancel: Joi.object({
		sessionId: Joi.string()
			.required()
			.custom((value, helper) => {
				const valid = isValidId(`${value}`);

				return valid ? value : helper.error("any.custom");
			})
			.messages({
				"string.base": `"sessionId" field has to be of type string!`,
				"string.empty": `"sessionId" field can't be empty!`,
				"any.custom": `"sessionId" field is not a valid ID`,
				"any.required": `"sessionId" field is required!`,
			}),
	}),
	renew: Joi.object({
		refreshToken: Joi.string().trim().min(3).max(300).required().messages({
			"string.base": `"refreshToken" field has to be of type string!`,
			"string.empty": `"refreshToken" field can't be empty!`,
			"string.min": `"refreshToken" field can't be true!`,
			"string.max": `"refreshToken" field can't be true!`,
			"any.required": `"refreshToken" field is required!`,
		}),
	}),

	validate: Joi.object({
		accessToken: Joi.string().trim().min(3).max(300).required().messages({
			"string.base": `"accessToken" field has to be of type string!`,
			"string.empty": `"accessToken" field can't be empty!`,
			"string.min": `"accessToken" field can't be true!`,
			"string.max": `"accessToken" field can't be true!`,
			"any.required": `"accessToken" field is required!`,
		}),
	}),
};
