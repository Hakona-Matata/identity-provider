/**
 * Joi schema objects for validating request bodies in SessionController methods
 * @module SessionValidators
 */

const Joi = require("joi");
const { id, token } = require("./../../validators/index");

/**
 * Joi schema object for validating cancel request body
 * @type {Joi.ObjectSchema}
 */
const cancel = Joi.object({
	sessionId: id,
});

/**
 * Joi schema object for validating renew request body
 * @type {Joi.ObjectSchema}
 */
const renew = Joi.object({
	refreshToken: token,
});

/**
 * Joi schema object for validating validate request body
 * @type {Joi.ObjectSchema}
 */
const validate = Joi.object({
	accessToken: token,
});

module.exports = {
	cancel,
	renew,
	validate,
};
