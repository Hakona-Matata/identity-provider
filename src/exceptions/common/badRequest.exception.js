const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../constants/index");

const BaseAppException = require("../baseAppException");

/**
 * Exception indicating that the request is malformed or invalid.
 *
 * @class BadRequestException
 * @extends BaseAppException
 * @param {string} [message="Sorry, you sent a bad request!"] - The error message.
 */
module.exports = class BadRequestException extends BaseAppException {
	constructor(message) {
		super(
			httpStatusCodeStrings.BAD_REQUEST,
			httpStatusCodeNumbers.BAD_REQUEST,
			message || "Sorry, you sent a bad request!"
		);
	}
};
