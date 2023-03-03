const Joi = require("joi");
const { validate_phone } = require("./../../helpers/phone");

module.exports = {
	enableSMS: Joi.object({
		phone: Joi.string()
			.required()
			.custom((value, helper) => {
				const { isValid, phoneNumber, countryCode, countryName, countryIso2 } =
					validate_phone(value);

				if (!isValid) {
					return helper.message(
						`"phone" field is invalid (Must be in "E.164" format)`
					);
				}

				return { phoneNumber, countryCode, countryName, countryIso2 };
			})
			.messages({
				"string.base": `"phone" field has to be of type string!`,
				"string.empty": `"phone" field can't be empty!`,
				"any.required": `"phone" field is required!`,
			}),
		userId: Joi.string().hex().length(24).required().messages({
			"string.base": `"userId" field has to be of type string!`,
			"string.empty": `"userId" field can't be empty!`,
			"string.length": `"userId" field length can't be true!`,
			"string.hex": `"userId" field is not valid!`,
			"any.required": `"userId" field is required!`,
		}),
	}),
};
