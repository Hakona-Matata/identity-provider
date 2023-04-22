const Joi = require("joi");
const { id, token } = require("./../../validators/index");

module.exports = {
	cancel: Joi.object({
		sessionId: id,
	}),
	renew: Joi.object({
		refreshToken: token,
	}),

	validate: Joi.object({
		accessToken: token,
	}),
};
