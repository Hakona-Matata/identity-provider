const Joi = require("joi");
const isValidId = require("./../../helpers/isValidObjectId");

module.exports = {
	confirmOTP: Joi.object({
		otp: Joi.number()
			.integer()
			.positive()
			.required()
			.min(100_000)
			.max(999999)
			.messages({
				"any.required": `"otp" field is required!`,
				"number.base": `"otp" field has to be of type number!`,
				"number.integer": `"otp" field has to be integer!`,
				"number.positive": `"otp" field has to be positive!`,
				"number.min": `"otp" field has to be 6 digits!`,
				"number.max": `"otp" field has to be 6 digits!`,
			}),
	}),
	sendOTP: Joi.object({
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
		email: Joi.string().trim().min(15).max(40).email().required().messages({
			"string.base": `"email" field has to be of type string!`,
			"string.email": `"email" field has to be a valid email!`,
			"string.empty": `"email" field can't be empty!`,
			"string.min": `"email" field can't be less than 15 characters!`,
			"string.max": `"email" field can't be more than 40 characers!`,
			"any.required": `"email" field is required!`,
		}),
	}),
	verifyOTP: Joi.object({
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
		otp: Joi.number()
			.integer()
			.positive()
			.required()
			.min(100_000)
			.max(999999)
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
