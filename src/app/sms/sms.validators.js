const Joi = require("joi");
const { phone, otp, id } = require("./../../validators/index");

module.exports = {
	enable: Joi.object({
		phone,
	}),
	confirm: Joi.object({
		otp,
	}),
	send: Joi.object({
		userId: id,
	}),
	verify: Joi.object({
		accountId: id,
		otp,
	}),
};
