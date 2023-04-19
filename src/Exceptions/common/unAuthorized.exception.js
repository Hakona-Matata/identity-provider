const StatusCodeConstant = require("../../constants/statusCodes");
const ErrorCodeConstant = require("../../constants/errorCodes");

const BaseAppException = require("../baseAppException");

module.exports = class unAuthorizedException extends BaseAppException {
	constructor(message) {
		super(
			ErrorCodeConstant.UNAUTHORIZED,
			StatusCodeConstant.UNAUTHORIZED,
			message || "Sorry, you are not authorized to do this!"
		);
	}
};
