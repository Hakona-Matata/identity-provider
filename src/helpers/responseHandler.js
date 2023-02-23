const success = ({ res, result }) => {
	return res.status(200).json({ data: result });
};

const failure = ({ res, error }) => {
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

	res.status(500).json({ data: error.message });
};

module.exports = { success, failure };
