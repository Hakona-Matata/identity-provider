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
};