const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../constants/index");

const BaseAppException = require("../baseAppException");

/**
 * Represents an exception that occurs when an internal server error is encountered.
 *
 * @class InternalServerException
 * @extends BaseAppException
 */
class InternalServerException extends BaseAppException {
	/**
	 * Creates a new instance of the `InternalServerException` class.
	 * @param {string} [message] - The error message to be displayed.
	 */
	constructor(message) {
		super(
			httpStatusCodeStrings.INTERNAL_SERVER_ERROR,
			httpStatusCodeNumbers.INTERNAL_SERVER_ERROR,
			message || "Sorry, the process went wrong!"
		);
	}
}
module.exports = InternalServerException;
