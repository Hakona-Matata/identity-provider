const Joi = require("joi");
const { totp } = require("./../../validators/index");

module.exports = {
	confirm: Joi.object({
		totp,
	}),
};
