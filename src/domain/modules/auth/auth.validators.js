/**
 * Joi schema objects for user authentication and verification.
 * @module JoiSchemas
 */

const Joi = require("joi");
const { email, token, userName, password, confirmPassword, role } = require("./../../../shared/validations");

/**
 * Joi schema object for user sign up.
 * @type {Object}
 * @property {Joi.StringSchema} email - Email address of the user.
 * @property {Joi.StringSchema} userName - Username of the user.
 * @property {Joi.StringSchema} password - Password of the user.
 * @property {Joi.StringSchema} confirmPassword - Confirm password of the user.
 * @property {Joi.StringSchema} role - Role of the user.
 */
module.exports.signUp = Joi.object({
	email,
	userName,
	password,
	confirmPassword,
	role,
});

/**
 * Joi schema object for user verification.
 * @type {Object}
 * @property {Joi.StringSchema} verificationToken - Token for user verification.
 */
module.exports.verify = Joi.object({
	verificationToken: token,
});

/**
 * Joi schema object for user login.
 * @type {Object}
 * @property {Joi.StringSchema} email - Email address of the user.
 * @property {Joi.StringSchema} password - Password of the user.
 */
module.exports.login = Joi.object({
	email,
	password,
});
