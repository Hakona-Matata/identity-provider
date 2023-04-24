module.exports = class BaseAppException extends Error {
	constructor(errorCode, statusCode, message) {
		super(message);

		this.errorCode = errorCode;
		this.statusCode = statusCode;
		this.message = message;
	}
};
