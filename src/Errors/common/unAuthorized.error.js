const StatusCodeConstant = require("../../constants/statusCodes");
const ErrorCodeConstant = require("../../constants/errorCodes");

const BaseAppError = require("../baseAppException");

module.exports = class unAuthorizedException extends BaseAppError {
	constructor() {
		super(
			ErrorCodeConstant.UNAUTHORIZED,
			StatusCodeConstant.UNAUTHORIZED,
			"Sorry, you are not authorized to do this!"
		);
	}
};
