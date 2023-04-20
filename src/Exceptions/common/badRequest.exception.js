const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../constants/index");

const BaseAppException = require("../baseAppException");

module.exports = class BadRequestException extends BaseAppException {
	constructor(message) {
		super(
			httpStatusCodeStrings.BAD_REQUEST,
			httpStatusCodeNumbers.BAD_REQUEST,
			message || "Sorry, you sent a bad request!"
		);
	}
};
