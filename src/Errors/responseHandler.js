const jwt_errors = require("./jwt");

const success = ({ res, result }) => {
	return res.status(200).json({ data: result });
};

const failure = ({ res, error }) => {
	// console.log({ error });
	// console.log("--------------");
	// console.log(error.name);
	// console.log("--------------");
	// console.log(error.details);

	// Validation errors
	if (error.name === "ValidationError") {
		return res
			.status(422)
			.json({ data: error.details.map((error) => error.message) });
	}

	// MongoDB Duplication Error
	if (error.name === "MongoServerError" && error.code === 11000) {
		return res.status(422).json({
			data: Object.keys(error.keyValue).map(
				(field) => (field = `Sorry, this ${field} may be already taken!`)
			),
		});
	}

	// Nodemailer SSL Error
	if (error.code === "ESOCKET") {
		return res.status(422).json({
			data: "Sorry, the connection needs to be secure using SSL!",
		});
	}

	// Custom message || InvalidInput
	if (error.name === "CustomError" && error.code === "InvalidInput") {
		return res.status(422).json({
			data: error.message,
		});
	}

	// Custom message | UnAuthorized
	if (error.name === "CustomError" && error.code === "UnAuthorized") {
		return res.status(401).json({
			data: error.message,
		});
	}

	if (error.name.toLowerCase().includes("token")) {
		return jwt_errors({ res, error });
	}

	console.log("Unhandledd error!!!!!!!!!!!!!!!");
	console.log("--------------------------------------------");
	console.log({ error });
	console.log("--------------------------------------------");
};

module.exports = { success, failure };
