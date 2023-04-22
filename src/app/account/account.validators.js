const Joi = require("joi");
const { email, token } = require("./../../validators/index");

module.exports = {
	activate: Joi.object({
		email,
	}),
	confirmActivation: Joi.object({
		activationToken: token,
	}),
};
