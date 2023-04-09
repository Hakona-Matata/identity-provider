const StatusCodeConstant = require("../../constants/statusCodes");
const ErrorCodeConstant = require("../../constants/errorCodes");

const BaseAppException = require("../baseAppException");

module.exports = class ValidationException extends BaseAppException {
	constructor(message) {
		super(ErrorCodeConstant.UNPROCESSABLE_ENTITY, StatusCodeConstant.UNPROCESSABLE_ENTITY, message);
	}
};
