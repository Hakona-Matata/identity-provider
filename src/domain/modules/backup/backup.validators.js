const Joi = require("joi");

const { email, code } = require("./../../../shared/validations");

/**
 * @typedef {Object} ConfirmSchema
 * @property {string} code - The confirmation code.
 */

/**
 * @typedef {Object} VerifySchema
 * @property {string} email - The email of the user to be verified.
 * @property {string} code - The verification code.
 */

/**
 * @type {Object.<string, import('joi').Schema>}
 */
module.exports = {
	/**
	 * The Joi schema for the confirmation code.
	 * @type {import('joi').Schema}
	 */
	confirm: Joi.object({
		code,
	}),
	/**
	 * The Joi schema for account recovery.
	 * @type {import('joi').Schema}
	 */
	recover: Joi.object({
		email,
		code,
	}),
};
