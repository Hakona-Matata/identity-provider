const Joi = require("joi");
const { totp, id, otp } = require("./../../validators/index");

module.exports = {
	confirm: Joi.object({
		totp,
	}),
	verify: Joi.object({
		accountId: id,
		otp,
	}),
};
