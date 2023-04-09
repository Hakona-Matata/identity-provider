const StatusCodeConstant = require("../../constants/statusCodes");
const ErrorCodeConstant = require("../../constants/errorCodes");

const BaseAppException = require("../baseAppException");

module.exports = class InternalServerException extends BaseAppException {
	constructor() {
		super(
			ErrorCodeConstant.INTERNAL_SERVER_ERROR,
			StatusCodeConstant.INTERNAL_SERVER_ERROR,
			"Sorry, something went wrong!"
		);
	}
};
