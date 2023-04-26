const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../constants/index");

const BaseAppException = require("../baseAppException");

/**
 * Exception class for Unprocessable Entity HTTP errors (status code 422).
 *
 * @class ValidationException
 * @extends BaseAppException
 * @param {string} [message] - The error message to be displayed.
 */
module.exports = class ValidationException extends BaseAppException {
	constructor(message) {
		super(
			httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			message || "Sorry, the validation process failed!"
		);
	}
};
