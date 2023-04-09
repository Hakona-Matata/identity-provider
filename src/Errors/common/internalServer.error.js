const StatusCodeConstant = require("../../constants/statusCodes");
const ErrorCodeConstant = require("../../constants/errorCodes");

const BaseAppError= require("../baseAppError");

module.exports = class InternalServerError extends BaseAppError {
	constructor() {
		super(
			ErrorCodeConstant.INTERNAL_SERVER_ERROR,
			StatusCodeConstant.INTERNAL_SERVER_ERROR,
			"Sorry, something went wrong!"
		);
	}
};
