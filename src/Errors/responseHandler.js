const success = ({ res, result }) => {
	return res.status(200).json({ data: result });
};

const failure = ({ res, error }) => {
	console.log({ error });
	console.log("--------------");
	console.log(error.name);
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

	// JWT Invalid signature
	if (
		error.name === "JsonWebTokenError" &&
		error.message === "invalid signature"
	) {
		return res.status(401).json({ data: "Sorry, your token is invalid!" });
	}

	// JWT Expiration
	if (error.name === "TokenExpiredError" && error.message === "jwt expired") {
		return res.status(401).json({ data: "Sorry, your token is expired!" });
	}

	// Custom message
	if (error.name === "CustomError" && error.code === "InvalidInput") {
		return res.status(422).json({
			data: error.message,
		});
	}

	return res.status(500).json({ data: error.message });
};

module.exports = { success, failure };