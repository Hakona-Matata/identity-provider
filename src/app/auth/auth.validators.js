const Joi = require("joi");
const { email, token, userName, password, confirmPassword, role } = require("./../../validators/index");

module.exports = {
	signUp: Joi.object({
		email,
		userName,
		password,
		confirmPassword,
		role,
	}),
	verify: Joi.object({
		verificationToken: token,
	}),
	login: Joi.object({
		email,
		password,
	}),
};
