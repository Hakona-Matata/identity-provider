/**
 * Exception class for Not Found HTTP errors (status code 404).
 *
 * @class NotFoundException
 * @extends BaseAppException
 * @param {string} [message] - The error message to be displayed.
 */

const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../constants/index");

const BaseAppException = require("../baseAppException");

module.exports = class NotFoundException extends BaseAppException {
	constructor(message) {
		super(
			httpStatusCodeStrings.NOT_FOUND,
			httpStatusCodeNumbers.NOT_FOUND,
			message || "Sorry, this resource is not found!"
		);
	}
};
