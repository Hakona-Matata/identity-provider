const StatusCodeConstant = require("../../constants/statusCodes");
const ErrorCodeConstant = require("../../constants/errorCodes");

const BaseAppError = require("../baseAppError");

module.exports = class NotFoundError extends BaseAppError {
	constructor(message) {
		super(ErrorCodeConstant.NOT_FOUND, StatusCodeConstant.NOT_FOUND, message);
	}
};
