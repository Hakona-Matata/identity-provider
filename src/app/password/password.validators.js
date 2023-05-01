/**
 * Joi validation schema for the password change request
 *
 * @typedef {object} ChangePasswordSchema
 * @property {string} oldPassword - The old password of the account
 * @property {string} newPassword - The new password for the account
 * @property {string} confirmNewPassword - The confirmation of the new password
 */

/**
 * Joi validation schema for the password forget request
 *
 * @typedef {object} ForgetPasswordSchema
 * @property {string} email - The email of the account to reset the password for
 */

/**
 * Joi validation schema for the password reset request
 *
 * @typedef {object} ResetPasswordSchema
 * @property {string} resetToken - The token to verify the password reset request
 * @property {string} password - The new password for the account
 * @property {string} confirmPassword - The confirmation of the new password
 */

const Joi = require("joi");
const { confirmPassword, email, token, password } = require("./../../validators/index");

/**
 * Object containing Joi validation schemas for the password related requests
 *
 * @typedef {object} PasswordValidators
 * @property {Joi.ObjectSchema<ChangePasswordSchema>} change - Joi validation schema for password change request
 * @property {Joi.ObjectSchema<ForgetPasswordSchema>} forget - Joi validation schema for password forget request
 * @property {Joi.ObjectSchema<ResetPasswordSchema>} reset - Joi validation schema for password reset request
 */

/**
 * Joi validation schema for the password change request
 *
 * @type {Joi.ObjectSchema<ChangePasswordSchema>}
 */
const change = Joi.object({
	oldPassword: password,
	password: password,
	confirmPassword: confirmPassword,
});

/**
 * Joi validation schema for the password forget request
 *
 * @type {Joi.ObjectSchema<ForgetPasswordSchema>}
 */
const forget = Joi.object({
	email,
});

/**
 * Joi validation schema for the password reset request
 *
 * @type {Joi.ObjectSchema<ResetPasswordSchema>}
 */
const reset = Joi.object({
	resetToken: token,
	password,
	confirmPassword,
});

module.exports = {
	change,
	forget,
	reset,
};
