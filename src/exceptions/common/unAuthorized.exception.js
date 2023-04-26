const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../constants/index");

const BaseAppException = require("../baseAppException");

/**
 * Exception indicating that the user is not authorized to access a resource or perform an action.
 *
 * @class unAuthorizedException
 * @extends BaseAppException
 * @param {string} [message="Sorry, you are not authorized to do this!"] - The error message.
 */
module.exports = class unAuthorizedException extends BaseAppException {
	constructor(message) {
		super(
			httpStatusCodeStrings.UNAUTHORIZED,
			httpStatusCodeNumbers.UNAUTHORIZED,
			message || "Sorry, you are not authorized to do this!"
		);
	}
};
