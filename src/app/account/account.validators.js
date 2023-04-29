/**
 * An object that contains Joi schema objects for activation related validations.
 *
 * @module activationValidations
 * @typedef {Object} module:activationValidations
 * @property {Object} activate - Joi schema object for validating activation email.
 * @property {Object} confirmActivation - Joi schema object for validating activation token.
 */

const Joi = require("joi");
const { email, token } = require("./../../validators/index");

module.exports = {
	/**
	 * Joi schema object for validating activation email.
	 *
	 * @memberof module:activationValidations
	 * @type {Joi.ObjectSchema}
	 */
	activate: Joi.object({
		email,
	}),

	/**
	 * Joi schema object for validating activation token.
	 *
	 * @memberof module:activationValidations
	 * @type {Joi.ObjectSchema}
	 */
	confirmActivation: Joi.object({
		activationToken: token,
	}),

	/**
	 * Joi schema object for validating email during account termination cancelation.
	 *
	 * @memberof module:activationValidations
	 * @type {Joi.ObjectSchema}
	 */
	cancel: Joi.object({
		email,
	}),
};
