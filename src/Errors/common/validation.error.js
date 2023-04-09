const StatusCodeConstant = require("../../constants/statusCodes");
const ErrorCodeConstant = require("../../constants/errorCodes");

const BaseAppError = require("../baseAppException");

module.exports = class ValidationError extends BaseAppError {
	constructor(message) {
		super(
			ErrorCodeConstant.UNPROCESSABLE_ENTITY,
			StatusCodeConstant.UNPROCESSABLE_ENTITY,
			message
		);
	}
};
