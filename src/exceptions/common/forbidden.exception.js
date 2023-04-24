const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../constants/index");

const BaseAppException = require("../baseAppException");

module.exports = class ForbiddenException extends BaseAppException {
	constructor(message) {
		super(
			httpStatusCodeStrings.FORBIDDEN,
			httpStatusCodeNumbers.FORBIDDEN,
			message || "Sorry, you are not allowed to do this!"
		);
	}
};
