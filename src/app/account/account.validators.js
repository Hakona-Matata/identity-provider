const Joi = require("joi");

module.exports = {
	activate: Joi.object({
		email: Joi.string().trim().min(15).max(40).email().required().messages({
			"string.base": `"email" field has to be of type string!`,
			"string.email": `"email" field has to be a valid email!`,
			"string.empty": `"email" field can't be empty!`,
			"string.min": `"email" field can't be less than 15 characters!`,
			"string.max": `"email" field can't be more than 40 characers!`,
			"any.required": `"email" field is required!`,
		}),
	}),
	confirmActivation: Joi.object({
		activationToken: Joi.string().trim().min(3).max(300).required().messages({
			"string.base": `"activationToken" param has to be of type string!`,
			"string.empty": `"activationToken" param can't be empty!`,
			"string.min": `"activationToken" param can't be true!`,
			"string.max": `"activationToken" param can't be true!`,
			"any.required": `"activationToken" param is required!`,
		}),
	}),
};
