const Joi = require("joi");
const { confirmPassword, email, token, password } = require("./../../validators/index");

module.exports = {
	change: Joi.object({
		oldPassword: password,
		newPassword: password,
		confirmNewPassword: confirmPassword,
	}),
	forget: Joi.object({
		email,
	}),
	reset: Joi.object({
		resetToken: token,
		password,
		confirmPassword: password,
	}),
};
