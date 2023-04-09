const StatusCodeConstant = require("../../constants/statusCodes");
const ErrorCodeConstant = require("../../constants/errorCodes");

const BaseAppError = require("../baseAppError");

module.exports = class unAuthorizedException extends BaseAppError {
	constructor(message) {
		super(
			ErrorCodeConstant.UNAUTHORIZED,
			StatusCodeConstant.UNAUTHORIZED,
			message || "Sorry, you are not authorized to do this!"
		);
	}
};
