/**
 * Joi schemas for validating TOTP input data.
 * @module totpValidators
 */

const Joi = require("joi");
const { id, code } = require("./../../validators/index");

/**
 * Joi schema for validating TOTP confirmation input data.
 * @type {Joi.ObjectSchema}
 */
const confirm = Joi.object({
	totp: code,
});

/**
 * Joi schema for validating TOTP verification input data.
 * @type {Joi.ObjectSchema}
 */
const verify = Joi.object({
	accountId: id,
	totp: code,
});

module.exports = {
	confirm,
	verify,
};
