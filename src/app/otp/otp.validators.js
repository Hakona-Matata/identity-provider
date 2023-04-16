const Joi = require("joi");
const isValidId = require("./../../helpers/isValidObjectId");

module.exports = {
	confirm: Joi.object({
		otp: Joi.number().integer().positive().required().min(100_000).max(999999).messages({
			"any.required": `"otp" field is required!`,
			"number.base": `"otp" field has to be of type number!`,
			"number.integer": `"otp" field has to be integer!`,
			"number.positive": `"otp" field has to be positive!`,
			"number.min": `"otp" field has to be 6 digits!`,
			"number.max": `"otp" field has to be 6 digits!`,
		}),
	}),
	send: Joi.object({
		accountId: Joi.string()
			.required()
			.custom((value, helper) => {
				const valid = isValidId(`${value}`);

				return valid ? value : helper.error("any.custom");
			})
			.messages({
				"string.base": `"accountId" field has to be of type string!`,
				"string.empty": `"accountId" field can't be empty!`,
				"any.custom": `"accountId" field is not a valid ID`,
				"any.required": `"accountId" field is required!`,
			}),
	}),
	verify: Joi.object({
		userId: Joi.string()
			.required()
			.custom((value, helper) => {
				const valid = isValidId(`${value}`);

				return valid ? value : helper.error("any.custom");
			})
			.messages({
				"string.base": `"userId" field has to be of type string!`,
				"string.empty": `"userId" field can't be empty!`,
				"any.custom": `"userId" field is not a valid ID`,
				"any.required": `"userId" field is required!`,
			}),
		otp: Joi.number().integer().positive().required().min(100_000).max(999999).messages({
			"any.required": `"otp" field is required!`,
			"number.base": `"otp" field has to be of type number!`,
			"number.integer": `"otp" field has to be integer!`,
			"number.positive": `"otp" field has to be positive!`,
			"number.min": `"otp" field has to be 6 digits!`,
			"number.max": `"otp" field has to be 6 digits!`,
		}),
	}),
};
