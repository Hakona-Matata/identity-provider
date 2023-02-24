const Joi = require("joi");

module.exports = {
	signUp: Joi.object({
		email: Joi.string().trim().min(15).max(40).email().required().messages({
			"string.base": `"email" field has to be of type string!`,
			"string.email": `"email" field has to be a valid email!`,
			"string.empty": `"email" field can't be empty!`,
			"string.min": `"email field can't be less than 15 characters!`,
			"string.max": `"email field can't be more than 40 characers!`,
			"any.required": `"email field is required!`,
		}),
		userName: Joi.string()
			.alphanum()
			.trim()
			.min(5)
			.max(20)
			.required()
			.messages({
				"string.base": `"userName" field has to be of type string!`,
				"string.min": `"userName field can't be less than 5 characters!`,
				"string.max": `"userName field can't be more than 20 characers!`,
				"any.required": `"userName field is required!`,
				"string.alphanum": `"userName" field can only contains alphabet and numbers!`,
			}),
		password: Joi.string()
			.trim()
			.min(8)
			.max(16)
			.pattern(
				new RegExp(
					"^(?=(.*[a-z]){2,})(?=(.*[A-Z]){2,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()-__+.]){2,}).{8,16}$"
				)
			)
			.required()
			.messages({
				"string.base": `"password" field has to be of type string!`,
				"string.empty": `"password" field can't be empty!`,
				"string.min": `"password field can't be less than 8 characters!`,
				"string.max": `"password field can't be more than 16 characers!`,
				"any.required": `"password field is required!`,
				"string.pattern.base": `"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)`,
			}),
		confirmPassword: Joi.string()
			.required()
			.valid(Joi.ref("password"))
			.messages({
				"any.only": `"confirmPassword" field doesn't match "password" field`,
			}),
	}),
	verify: Joi.object({
		verificationToken: Joi.string().trim().min(3).max(200).required().messages({
			"string.base": `"verificationToken" param has to be of type string!`,
			"string.empty": `"verificationToken" param can't be empty!`,
			"string.min": `"verificationToken" param can't be true!`,
			"string.max": `"verificationToken" param can't be true!`,
			"any.required": `"verificationToken param is required!`,
		}),
	}),
	login: Joi.object({
		email: Joi.string().trim().min(15).max(40).email().required().messages({
			"string.base": `"email" field has to be of type string!`,
			"string.email": `"email" field has to be a valid email!`,
			"string.empty": `"email" field can't be empty!`,
			"string.min": `"email field can't be less than 15 characters!`,
			"string.max": `"email field can't be more than 40 characers!`,
			"any.required": `"email field is required!`,
		}),
		password: Joi.string()
			.trim()
			.min(8)
			.max(16)
			.pattern(
				new RegExp(
					"^(?=(.*[a-z]){2,})(?=(.*[A-Z]){2,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()-__+.]){2,}).{8,16}$"
				)
			)
			.required()
			.messages({
				"string.base": `"password" field has to be of type string!`,
				"string.empty": `"password" field can't be empty!`,
				"string.min": `"password field can't be less than 8 characters!`,
				"string.max": `"password field can't be more than 16 characers!`,
				"any.required": `"password field is required!`,
				"string.pattern.base": `"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)`,
			}),
	}),
};
