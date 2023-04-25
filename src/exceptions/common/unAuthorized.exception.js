const {httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../constants/index");

const BaseAppException = require("../baseAppException");

module.exports = class unAuthorizedException extends BaseAppException {
	constructor(message) {
		super(
			httpStatusCodeStrings.UNAUTHORIZED,
			httpStatusCodeNumbers.UNAUTHORIZED,
			message || "Sorry, you are not authorized to do this!"
		);
	}
};
