const Joi = require("joi");
const isValidId = require("./../../helpers/isValidObjectId");

//*we are validating totp as string as our previous number validation is not working
//*as the totp may begin with 0 and Joi doen't count zeros if they were at the beginning (number)!

module.exports = {
	confirm: Joi.object({
		totp: Joi.string().length(6).required().messages({
			"string.base": `"totp" field has to be of type string!`,
			"string.empty": `"totp" field can't be empty!`,
			"string.length": `"totp" field length must be 6 digits!`,
			"any.required": `"totp" field is required!`,
		}),
	}),
};
