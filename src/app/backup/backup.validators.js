const Joi = require("joi");

const { email, code } = require("./../../validators/index");

module.exports = {
	confirm: Joi.object({
		code,
	}),
	verify: Joi.object({
		email,
		code,
	}),
};
