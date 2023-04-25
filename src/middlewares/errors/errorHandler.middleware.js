const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../constants/index");

module.exports = (error, req, res, next) => {
	console.log("*******************************************************8");
	console.log({ error });
	console.log({ name: error.name, code: error.code, message: error.message });
	console.log("*******************************************************8");
	switch (error.name) {
		case "JsonWebTokenError":
			return res.status(httpStatusCodeNumbers.UNAUTHORIZED).json({
				success: false,
				status: httpStatusCodeNumbers.UNAUTHORIZED,
				code: httpStatusCodeStrings.UNAUTHORIZED,
				message: `Sorry, the given token is invalid!`,
			});

		case "TokenExpiredError":
			return res.status(httpStatusCodeNumbers.UNAUTHORIZED).json({
				success: false,
				status: httpStatusCodeNumbers.UNAUTHORIZED,
				code: httpStatusCodeStrings.UNAUTHORIZED,
				message: `Sorry, the given token is expired!`,
			});

		case "ValidationError":
			return res.status(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY).json({
				success: false,
				status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
				code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
				message: error.message.split(": ")[2] || error.details.map((error) => error.message),
			});

		case "MongoServerError":
			console.log({ name: error.name, code: error.code, message: error.message });

			if (error.code === 11000) {
				return res.status(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY).json({
					success: false,
					status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
					code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
					message: Object.keys(error.keyValue).map(
						(field) => (field = `Sorry, this ${field} may be already taken!`)
					)[0],
				});
			}

			break;

		case "MongooseError":
			console.log({ name: error.name, code: error.code, message: error.message });

			if (error.message.includes("timed out")) {
				return res.status(httpStatusCodeNumbers.REQUEST_TIMEOUT).json({
					success: false,
					status: httpStatusCodeNumbers.REQUEST_TIMEOUT,
					code: httpStatusCodeStrings.REQUEST_TIMEOUT,
					message: "Sorry, the request is timed out!",
				});
			}

			break;

		case "CastError":
			return res.status(httpStatusCodeNumbers.BAD_REQUEST).json({
				success: false,
				status: httpStatusCodeNumbers.BAD_REQUEST,
				code: httpStatusCodeStrings.BAD_REQUEST,
				message: `Sorry, the ${error.path} is not a valid ID`,
			});

		case "Error":
			return res.status(error.statusCode).json({
				success: false,
				status: error.statuscode,
				code: error.errorCode,
				message: error.message,
			});

		default:
			// TODO: Remove this after everything is okay!
			console.log("Unhandled error!!!!!!!!!!!!!!!");
			console.log("--------------------------------------------");
			console.log({ name: error.name, code: error.code, message: error.message });
			console.log("--------------------------------------------");

			return res.status(httpStatusCodeNumbers.INTERNAL_SERVER_ERROR).json({
				success: false,
				status: httpStatusCodeNumbers.INTERNAL_SERVER_ERROR,
				code: httpStatusCodeStrings.INTERNAL_SERVER_ERROR,
				message: "Sorry, internal server error happened!",
			});
	}

	next();
};
