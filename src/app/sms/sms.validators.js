const Joi = require("joi");
const { validate_phone } = require("./../../helpers/phone");
const isValidId = require("./../../helpers/isValidObjectId");

module.exports = {
	enable: Joi.object({
		phone: Joi.string()
			.required()
			.custom((value, helper) => {
				const { isValid, phone, country } = validate_phone(value);

				return !isValid ? helper.error("any.custom") : { phone, country };
			})
			.messages({
				"string.base": `"phone" field has to be of type string!`,
				"string.empty": `"phone" field can't be empty!`,
				"any.required": `"phone" field is required!`,
				"any.custom": `"phone" field is invalid (Must be in "E.164" format)`,
			}),
	}),
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
