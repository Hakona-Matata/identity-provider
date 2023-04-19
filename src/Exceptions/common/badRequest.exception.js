const StatusCodeConstant = require("../../constants/statusCodes");
const ErrorCodeConstant = require("../../constants/errorCodes");

const BaseAppException = require("../baseAppException");

module.exports = class BadRequestException extends BaseAppException {
	constructor(message) {
		super(ErrorCodeConstant.BAD_REQUEST, StatusCodeConstant.BAD_REQUEST, message);
	}
};
