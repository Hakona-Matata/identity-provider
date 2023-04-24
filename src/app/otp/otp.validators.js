const Joi = require("joi");
const { code, id } = require("./../../validators/index");

module.exports = {
	confirm: Joi.object({
		otp: code,
	}),
	send: Joi.object({
		accountId: id,
	}),
	verify: Joi.object({
		accountId: id,
		otp: code,
	}),
};
