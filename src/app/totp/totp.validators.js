const Joi = require("joi");
const { id, code } = require("./../../validators/index");

module.exports = {
	confirm: Joi.object({
		totp: code,
	}),
	verify: Joi.object({
		accountId: id,
		totp: code,
	}),
};
