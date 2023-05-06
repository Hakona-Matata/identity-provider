const { httpStatusCodes, httpStatusMessages } = require("./../../constants/index");
const BaseException = require("../baseException");

/**
 * Represents an exception that occurs when an internal server error is encountered.
 *
 * @class InternalServerException
 * @extends BaseException
 */
class InternalServerException extends BaseException {
	/**
	 * Creates a new instance of the `InternalServerException` class.
	 * @param {string} [errorMessage] - The error message to be displayed.
	 */
	constructor(errorMessage) {
		super(
			httpStatusCodes.INTERNAL_SERVER_ERROR,
			httpStatusMessages.INTERNAL_SERVER_ERROR,
			errorMessage || "Sorry, the process went wrong!"
		);
	}
}
module.exports = InternalServerException;
