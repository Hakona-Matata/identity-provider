const Joi = require("joi");

module.exports = {
	change: Joi.object({
		oldPassword: Joi.string()
			.trim()
			.min(8)
			.max(16)
			.pattern(new RegExp("^(?=(.*[a-z]){2,})(?=(.*[A-Z]){2,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()-__+.]){2,}).{8,16}$"))
			.required()
			.messages({
				"string.base": `"oldPassword" field has to be of type string!`,
				"string.empty": `"oldPassword" field can't be empty!`,
				"string.min": `"oldPassword" field can't be less than 8 characters!`,
				"string.max": `"oldPassword" field can't be more than 16 characers!`,
				"any.required": `"oldPassword" field is required!`,
				"string.pattern.base": `"oldPassword" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)`,
			}),
		newPassword: Joi.string()
			.trim()
			.min(8)
			.max(16)
			.pattern(new RegExp("^(?=(.*[a-z]){2,})(?=(.*[A-Z]){2,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()-__+.]){2,}).{8,16}$"))
			.required()
			.messages({
				"string.base": `"newPassword" field has to be of type string!`,
				"string.empty": `"newPassword" field can't be empty!`,
				"string.min": `"newPassword" field can't be less than 8 characters!`,
				"string.max": `"newPassword" field can't be more than 16 characers!`,
				"any.required": `"newPassword" field is required!`,
				"string.pattern.base": `"newPassword" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)`,
			}),
		confirmNewPassword: Joi.string().required().valid(Joi.ref("newPassword")).messages({
			"any.only": `"confirmNewPassword" field doesn't match "password" field`,
		}),
	}),
	forget: Joi.object({
		email: Joi.string().trim().min(15).max(40).email().required().messages({
			"string.base": `"email" field has to be of type string!`,
			"string.email": `"email" field has to be a valid email!`,
			"string.empty": `"email" field can't be empty!`,
			"string.min": `"email" field can't be less than 15 characters!`,
			"string.max": `"email" field can't be more than 40 characers!`,
			"any.required": `"email" field is required!`,
		}),
	}),
	reset: Joi.object({
		resetToken: Joi.string().trim().min(3).max(300).required().messages({
			"string.base": `"resetToken" param has to be of type string!`,
			"string.empty": `"resetToken" param can't be empty!`,
			"string.min": `"resetToken" param can't be true!`,
			"string.max": `"resetToken" param can't be true!`,
			"any.required": `"resetToken" param is required!`,
		}),
		password: Joi.string()
			.trim()
			.min(8)
			.max(16)
			.pattern(new RegExp("^(?=(.*[a-z]){2,})(?=(.*[A-Z]){2,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()-__+.]){2,}).{8,16}$"))
			.required()
			.messages({
				"string.base": `"password" field has to be of type string!`,
				"string.empty": `"password" field can't be empty!`,
				"string.min": `"password" field can't be less than 8 characters!`,
				"string.max": `"password" field can't be more than 16 characers!`,
				"any.required": `"password" field is required!`,
				"string.pattern.base": `"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)`,
			}),
		confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
			"any.only": `"confirmPassword" field doesn't match "password" field`,
		}),
	}),
};
