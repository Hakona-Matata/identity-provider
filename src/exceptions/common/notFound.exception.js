const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../constants/index");

const baseAppException = require("../baseAppException");

module.exports = class NotFoundException extends baseAppException {
	constructor(message) {
		super(
			httpStatusCodeStrings.NOT_FOUND,
			httpStatusCodeNumbers.NOT_FOUND,
			message || "Sorry, this resource is not found!"
		);
	}
};
