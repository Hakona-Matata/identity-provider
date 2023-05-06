const { httpStatusCodes, httpStatusMessages } = require("./../../constants/index");
const BaseException = require("../baseException");

/**
 * Exception indicating that the request is malformed or invalid.
 *
 * @class BadRequestException
 * @extends BaseException
 * @param {string} [errorMessage="Sorry, you sent a bad request!"] - The error message.
 */
module.exports = class BadRequestException extends BaseException {
	constructor(errorMessage) {
		super(
			httpStatusCodes.BAD_REQUEST,
			httpStatusMessages.BAD_REQUEST,
			errorMessage || "Sorry, you sent a bad request!"
		);
	}
};
