const statusCodes = require("../constants/statusCodes");
const errorCodes = require("../constants/errorCodes");

const success = ({ status = statusCodes.OK, code = errorCodes.OK, res, result }) => {
	return res.status(status).json({ success: true, status, code, data: result });
};

const failure = ({ res, error }) => {
	console.log("--------------");
	console.log({ error });
	console.log("--------------");
	// console.log(error.name);
	console.log("--------------");
	console.log(error.details);
	console.log("---------------------");
	console.log({ name: error.name });
	console.log({ message: error.message });
	console.log({ code: error.code });

	switch (error.name) {
		case "JsonWebTokenError":
			res.status(statusCodes.UNAUTHORIZED).json({
				success: false,
				status: statusCodes.UNAUTHORIZED,
				code: errorCodes.UNAUTHORIZED,
				message: `Sorry, the token is invalid!`,
			});
			break;

		case "TokenExpiredError":
			res.status(statusCodes.UNAUTHORIZED).json({
				success: false,
				status: statusCodes.UNAUTHORIZED,
				code: errorCodes.UNAUTHORIZED,
				message: `Sorry, the token is expired!`,
			});
			break;

		case "ValidationError":
			// console.log("-----------------------");
			// console.log({ error });
			// console.log("-----------------------");

			res.status(statusCodes.UNPROCESSABLE_ENTITY).json({
				success: false,
				status: statusCodes.UNPROCESSABLE_ENTITY,
				code: errorCodes.UNPROCESSABLE_ENTITY,
				message: error.message.split(": ")[2] || error.details.map((error) => error.message),
			});
			break;

		case "MongoServerError":
			if (error.code === 11000) {
				return res.status(statusCodes.UNPROCESSABLE_ENTITY).json({
					success: false,
					status: statusCodes.UNPROCESSABLE_ENTITY,
					code: errorCodes.UNPROCESSABLE_ENTITY,
					message: Object.keys(error.keyValue).map(
						(field) => (field = `Sorry, this ${field} may be already taken!`)
					)[0],
				});
			}
			break;

		case "MongooseError":
			if (error.message.includes("timed out")) {
				return res.status(statusCodes.REQUEST_TIMEOUT).json({
					success: false,
					status: statusCodes.REQUEST_TIMEOUT,
					code: errorCodes.REQUEST_TIMEOUT,
					message: "Sorry, request timed out!",
				});
			}

		case "Error":
			if (error.code === "ESOCKET") {
				return res.status(statusCodes.BAD_REQUEST).json({
					success: false,
					status: statusCodes.BAD_REQUEST,
					code: errorCodes.BAD_REQUEST,
					message: "Sorry, the connection needs to be secure!",
				});
			}

			return res.status(error.statusCode).json({
				success: false,
				status: error.statusCode,
				code: error.errorCode,
				message: error.message,
			});
			break;

		// case "RangeError":
		// 	console.log({ error });
		// 	res.status(400).send("shit from range error");
		// 	break;

		case "CustomError":
			res.status(error.status).json({
				success: false,
				status: error.status,
				code: error.code,
				message: error.message,
			});
			break;

		default:
			console.log("Unhandled error!!!!!!!!!!!!!!!");
			console.log("--------------------------------------------");
			console.log({ name: error.name });
			console.log({ message: error.message });
			console.log({ code: error.code });
			console.log("--------------------------------------------");
			res.status(500).json({ data: "Something went wrong" });
			break;
	}
};

module.exports = { success, failure };
