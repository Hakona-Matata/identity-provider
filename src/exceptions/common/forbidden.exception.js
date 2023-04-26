const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../constants/index");

const BaseAppException = require("../baseAppException");

/**
 * Exception class for Forbidden HTTP errors (status code 403).
 *
 * @class ForbiddenException
 * @extends BaseAppException
 * @param {string} [message] - The error message to be displayed.
 * @param {string} [errorCode=FORBIDDEN] - The error code associated with the exception.
 * @param {number} [statusCode=403] - The HTTP status code associated with the exception.
 */

module.exports = class ForbiddenException extends BaseAppException {
	constructor(message) {
		super(
			httpStatusCodeStrings.FORBIDDEN,
			httpStatusCodeNumbers.FORBIDDEN,
			message || "Sorry, you are not allowed to do this!"
		);
	}
};
