const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../constants/index");

/**
 * Error handling middleware for handling various types of errors.
 *
 * @module middleware/errorHandler
 * @param {Error} error - The error object.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
module.exports = async (error, req, res) => {
	let statusCode = httpStatusCodeNumbers.INTERNAL_SERVER_ERROR;
	let errorCode = httpStatusCodeStrings.INTERNAL_SERVER_ERROR;
	let errorMessage = "Sorry, an internal server error occurred!";

	switch (error.name) {
		case "JsonWebTokenError":
			statusCode = httpStatusCodeNumbers.UNAUTHORIZED;
			errorCode = httpStatusCodeStrings.UNAUTHORIZED;
			errorMessage = "Sorry, the given token is invalid!";
			break;

		case "TokenExpiredError":
			statusCode = httpStatusCodeNumbers.UNAUTHORIZED;
			errorCode = httpStatusCodeStrings.UNAUTHORIZED;
			errorMessage = "Sorry, the given token has expired!";
			break;

		case "ValidationError":
			statusCode = httpStatusCodeNumbers.UNPROCESSABLE_ENTITY;
			errorCode = httpStatusCodeStrings.UNPROCESSABLE_ENTITY;
			errorMessage = error.message.split(": ")[2] || error.details.map((error) => error.message);
			break;

		case "MongoServerError":
			if (error.code === 11000) {
				statusCode = httpStatusCodeNumbers.UNPROCESSABLE_ENTITY;
				errorCode = httpStatusCodeStrings.UNPROCESSABLE_ENTITY;
				errorMessage = Object.keys(error.keyValue).map((field) => `Sorry, the ${field} may already be taken!`)[0];
			}
			break;

		case "MongooseError":
			if (error.message.includes("timed out")) {
				statusCode = httpStatusCodeNumbers.REQUEST_TIMEOUT;
				errorCode = httpStatusCodeStrings.REQUEST_TIMEOUT;
				errorMessage = "Sorry, the request has timed out!";
			}
			break;

		case "CastError":
			statusCode = httpStatusCodeNumbers.BAD_REQUEST;
			errorCode = httpStatusCodeStrings.BAD_REQUEST;
			errorMessage = `Sorry, the ${error.path} is not a valid ID`;
			break;

		case "Error":
			statusCode = error.statusCode;
			errorCode = error.errorCode;
			errorMessage = error.message;
			break;

		default:
			// TODO: Remove this after everything is okay!
			console.log("Unhandled error!!!!!!!!!!!!!!!");
			console.log("--------------------------------------------");
			console.log({ error });
			console.log({ name: error.name, code: error.code, message: error.message });
			console.log("--------------------------------------------");
	}

	return res.status(statusCode).json({
		success: false,
		status: statusCode,
		code: errorCode,
		message: errorMessage,
	});
};
