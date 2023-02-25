const Joi = require("joi");

module.exports = {
	cancel: Joi.object({
		sessionId: Joi.string().hex().length(24).required().messages({
			"string.base": `"sessionId" field has to be of type string!`,
			"string.empty": `"sessionId" field can't be empty!`,
			"string.length": `"sessionId" field length can't be true!`,
			"string.hex": `"sessionId" field is not valid!`,
			"any.required": `"sessionId" field is required!`,
		}),
	}),
};
