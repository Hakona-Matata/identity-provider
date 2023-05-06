const { httpStatusCodes, httpStatusMessages } = require("./../../../shared/constants");

/**
 * Error handling middleware for handling various types of errors.
 *
 * @module middleware/errorHandler
 * @param {Error} error - The error object.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
module.exports = async (error, req, res, next) => {
	let statusCode, statusMessage, errorMessage;

	switch (error.name) {
		case "JsonWebTokenError":
		case "TokenExpiredError":
			statusCode = httpStatusCodes.UNAUTHORIZED;
			statusMessage = httpStatusMessages.UNAUTHORIZED;
			errorMessage = `Sorry, the given token ${error.name === "JsonWebTokenError" ? "is invalid" : "has expired"}!`;
			break;

		case "ValidationError":
			statusCode = httpStatusCodes.UNPROCESSABLE_ENTITY;
			statusMessage = httpStatusMessages.UNPROCESSABLE_ENTITY;
			errorMessage = error.message.split(": ")[2] || error.details.map((error) => error.message);
			break;

		case "MongoServerError":
			if (error.code === 11000) {
				statusCode = httpStatusCodes.UNPROCESSABLE_ENTITY;
				statusMessage = httpStatusMessages.UNPROCESSABLE_ENTITY;
				errorMessage = Object.keys(error.keyValue).map((field) => `Sorry, the ${field} may be already taken!`)[0];
			}
			break;

		case "MongooseError":
			if (error.message.includes("timed out")) {
				statusCode = httpStatusCodes.REQUEST_TIMEOUT;
				statusMessage = httpStatusMessages.REQUEST_TIMEOUT;
				errorMessage = "Sorry, the request has timed out!";
			}
			break;

		case "CastError":
			statusCode = httpStatusCodes.BAD_REQUEST;
			statusMessage = httpStatusMessages.BAD_REQUEST;
			errorMessage = `Sorry, the ${error.path} is not a valid ID`;
			break;

		default:
			statusCode = error.statusCode || httpStatusCodes.INTERNAL_SERVER_ERROR;
			statusMessage = error.statusMessage || httpStatusMessages.INTERNAL_SERVER_ERROR;
			errorMessage = error.errorMessage || "Sorry, an internal server error occurred!";
	}

	if (error) {
		return res.status(statusCode).json({
			success: false,
			status: statusCode,
			code: statusMessage,
			message: errorMessage,
		});
	}

	next();
};
