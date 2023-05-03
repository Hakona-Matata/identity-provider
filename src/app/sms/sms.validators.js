/**
 * @typedef {Object} JoiObject
 * @property {Function} validate - Validates the given input value and schema.
 */
const Joi = require("joi");
const { phone, otp, id } = require("./../../validators/index");

/**
 * Joi schema for enabling SMS OTP feature
 *
 * @type {JoiObject}
 */
const enable = Joi.object({
	phone,
});

/**
 * Joi schema for confirming OTP code
 *
 * @type {JoiObject}
 */
const confirm = Joi.object({
	otp,
});

/**
 * Joi schema for sending SMS OTP
 *
 * @type {JoiObject}
 */
const send = Joi.object({
	userId: id,
});

/**
 * Joi schema for verifying OTP code
 *
 * @type {JoiObject}
 */
const verify = Joi.object({
	accountId: id,
	otp,
});

module.exports = {
	enable,
	confirm,
	send,
	verify,
};
