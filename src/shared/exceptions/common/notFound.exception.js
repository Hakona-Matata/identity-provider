const { httpStatusCodes, httpStatusMessages } = require("./../../constants");
const BaseException = require("../baseException");

/**
 * Exception class for Not Found HTTP errors (status code 404).
 *
 * @class NotFoundException
 * @extends BaseException
 * @param {string} [errorMessage] - The error message to be displayed.
 */

module.exports = class NotFoundException extends BaseException {
	constructor(errorMessage) {
		super(
			httpStatusCodes.NOT_FOUND,
			httpStatusMessages.NOT_FOUND,
			errorMessage || "Sorry, this resource is not found!"
		);
	}
};
