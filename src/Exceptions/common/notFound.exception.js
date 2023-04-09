const StatusCodeConstant = require("../../constants/statusCodes");
const ErrorCodeConstant = require("../../constants/errorCodes");

const baseAppException = require("../baseAppException");

module.exports = class NotFoundException extends baseAppException {
	constructor(message) {
		super(ErrorCodeConstant.NOT_FOUND, StatusCodeConstant.NOT_FOUND, message);
	}
};
