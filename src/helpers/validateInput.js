/**
 * Validates the input arguments based on the given validator.
 * @async
 * @function validateInput
 * @param {Joi.ObjectSchema} validator - The validator to validate the input arguments against.
 * @param {Object} args - The input arguments to be validated.
 * @returns {Promise<Joi.ValidationResult>} The result of the validation operation, which contains error details if the input arguments are not valid.
 */
const validateInput = async function validate(validator, args) {
	return validator.validateAsync(args, { abortEarly: false });
};

module.exports = validateInput;
