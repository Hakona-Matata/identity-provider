const { httpStatusCodes, httpStatusMessages } = require("./../../constants/index");
const BaseException = require("../baseException");

/**
 * Exception indicating that the user is not authorized to access a resource or perform an action.
 *
 * @class unAuthorizedException
 * @extends BaseException
 * @param {string} [errorMessage="Sorry, you are not authorized to do this!"] - The error message.
 */
module.exports = class unAuthorizedException extends BaseException {
	constructor(errorMessage) {
		super(
			httpStatusCodes.UNAUTHORIZED,
			httpStatusMessages.UNAUTHORIZED,
			errorMessage || "Sorry, you are not authorized to do this!"
		);
	}
};
