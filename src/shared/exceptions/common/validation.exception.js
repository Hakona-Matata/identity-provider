const { httpStatusCodes, httpStatusMessages } = require("./../../constants/index");
const BaseException = require("../baseException");

/**
 * Exception class for Unprocessable Entity HTTP errors (status code 422).
 *
 * @class ValidationException
 * @extends BaseException
 * @param {string} [errorMessage] - The error message to be displayed.
 */
module.exports = class ValidationException extends BaseException {
	constructor(errorMessage) {
		super(
			httpStatusCodes.UNPROCESSABLE_ENTITY,
			httpStatusMessages.UNPROCESSABLE_ENTITY,
			errorMessage || "Sorry, the validation process failed!"
		);
	}
};
