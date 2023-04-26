/**
 * Joi schema objects for validating OTP-related requests and responses.
 * @module OtpValidators
 */

const Joi = require("joi");
const { code, id } = require("./../../validators/index");

/**
 * Joi schema object for confirming an OTP code.
 * @type {Joi.ObjectSchema}
 */
const confirm = Joi.object({
	otp: code,
});

/**
 * Joi schema object for sending an OTP code to a specified account.
 * @type {Joi.ObjectSchema}
 */
const send = Joi.object({
	accountId: id,
});

/**
 * Joi schema object for verifying an OTP code for a specified account.
 * @type {Joi.ObjectSchema}
 */
const verify = Joi.object({
	accountId: id,
	otp: code,
});

module.exports = {
	confirm,
	send,
	verify,
};
