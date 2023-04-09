const StatusCodeConstant = require("../../constants/statusCodes");
const ErrorCodeConstant = require("../../constants/errorCodes");

const BaseAppError = require("../baseAppError");

module.exports = class BadRequestError extends BaseAppError {
	constructor(message) {
		super(
			ErrorCodeConstant.BAD_REQUEST,
			StatusCodeConstant.BAD_REQUEST,
			message
		);
	}
};
