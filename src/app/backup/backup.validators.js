const Joi = require("joi");

module.exports = {
	confirm: Joi.object({
		code: Joi.string().length(16).required().messages({
			"string.base": `"code" field has to be of type string!`,
			"string.empty": `"code" field can't be empty!`,
			"string.length": `"code" field length must be 16 characters!`,
			"any.required": `"code" field is required!`,
		}),
	}),
	verify: Joi.object({
		email: Joi.string().trim().min(15).max(40).email().required().messages({
			"string.base": `"email" field has to be of type string!`,
			"string.email": `"email" field has to be a valid email!`,
			"string.empty": `"email" field can't be empty!`,
			"string.min": `"email" field can't be less than 15 characters!`,
			"string.max": `"email" field can't be more than 40 characers!`,
			"any.required": `"email" field is required!`,
		}),
		code: Joi.string().length(16).required().messages({
			"string.base": `"code" field has to be of type string!`,
			"string.empty": `"code" field can't be empty!`,
			"string.length": `"code" field length must be 16 characters!`,
			"any.required": `"code" field is required!`,
		}),
	}),
};
