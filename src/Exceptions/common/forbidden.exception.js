const StatusCodeConstant = require("../../constants/statusCodes");
const ErrorCodeConstant = require("../../constants/errorCodes");

const BaseAppException = require("../baseAppException");

module.exports = class ForbiddenException extends BaseAppException {
	constructor(message) {
		super(
			ErrorCodeConstant.FORBIDDEN,
			StatusCodeConstant.FORBIDDEN,
			message || "Sorry, you are not allowed to do this!"
		);
	}
};
