const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../constants/index");

const BaseAppException = require("../baseAppException");

module.exports = class ValidationException extends BaseAppException {
	constructor(message) {
		super(
			httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			message || "Sorry, the validation process failed!"
		);
	}
};
