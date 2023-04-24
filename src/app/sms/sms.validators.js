const Joi = require("joi");
const { phone, code, id } = require("./../../validators/index");

module.exports = {
	enable: Joi.object({
		phone,
	}),
	confirm: Joi.object({
		otp: code,
	}),
	send: Joi.object({
		userId: id,
	}),
	verify: Joi.object({
		accountId: id,
		otp: code,
	}),
};
