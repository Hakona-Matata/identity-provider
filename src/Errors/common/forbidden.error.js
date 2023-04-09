const StatusCodeConstant = require("../../constants/statusCodes");
const ErrorCodeConstant = require("../../constants/errorCodes");

const BaseAppError = require("../baseAppError");

module.exports = class ForbiddenError extends BaseAppError {
	constructor(message) {
		super(
			ErrorCodeConstant.FORBIDDEN,
			StatusCodeConstant.FORBIDDEN,
			message || "Sorry, you are not allowed to do this!"
		);
	}
};
