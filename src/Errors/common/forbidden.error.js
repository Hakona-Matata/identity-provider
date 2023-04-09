const StatusCodeConstant = require("../../constants/statusCodes");
const ErrorCodeConstant = require("../../constants/errorCodes");

const BaseAppError = require("../baseAppError");

module.exports = class ForbiddenError extends BaseAppError {
	constructor() {
		super(
			ErrorCodeConstant.FORBIDDEN,
			StatusCodeConstant.FORBIDDEN,
			"Sorry, you are not allowed to do this!"
		);
	}
};
