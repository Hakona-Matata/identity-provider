const Joi = require("joi");
const { otp, id } = require("./../../validators/index");

module.exports = {
	confirm: Joi.object({
		otp,
	}),
	send: Joi.object({
		accountId: id,
	}),
	verify: Joi.object({
		accountId: id,
		otp,
	}),
};
