const { httpStatusCodes, httpStatusMessages } = require("./../../constants/index");
const BaseException = require("../baseException");

/**
 * Exception class for Forbidden HTTP errors (status code 403).
 *
 * @class ForbiddenException
 * @extends BaseException
 * @param {string} [errorMessage] - The error message to be displayed.
 * @param {string} [errorCode=FORBIDDEN] - The error code associated with the exception.
 * @param {number} [statusCode=403] - The HTTP status code associated with the exception.
 */

module.exports = class ForbiddenException extends BaseException {
	constructor(errorMessage) {
		super(
			httpStatusCodes.FORBIDDEN,
			httpStatusMessages.FORBIDDEN,
			errorMessage || "Sorry, you are not allowed to do this!"
		);
	}
};
