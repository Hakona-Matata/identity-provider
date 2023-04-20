const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../constants/index");

const BaseAppException = require("../baseAppException");

module.exports = class InternalServerException extends BaseAppException {
	constructor(message) {
		super(
			httpStatusCodeStrings.INTERNAL_SERVER_ERROR,
			httpStatusCodeNumbers.INTERNAL_SERVER_ERROR,
			message || "Sorry, the process went wrong!"
		);
	}
};
