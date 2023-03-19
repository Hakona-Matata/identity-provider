const Joi = require("joi");
const isValidId = require("./../../helpers/isValidObjectId");

//*we are validating totp as string as our previous number validation is not working
//*as the totp may begin with 0 and Joi doen't count zeros if they were at the beginning (number)

module.exports = {
	confirmTOTP: Joi.object({
		totp: Joi.string().length(6).required().messages({
			"string.base": `"totp" field has to be of type string!`,
			"string.empty": `"totp" field can't be empty!`,
			"string.length": `"totp" field length must be 6 digits!`,
			"any.required": `"totp" field is required!`,
		}),
	}),
	verifyTOTP: Joi.object({
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
		totp: Joi.string().length(6).required().messages({
			"string.base": `"totp" field has to be of type string!`,
			"string.empty": `"totp" field can't be empty!`,
			"string.length": `"totp" field length must be 6 digits!`,
			"any.required": `"totp" field is required!`,
		}),
	}),
};
