module.exports = ({ res, error }) => {
	// JWT Invalid signature
	if (
		error.name === "JsonWebTokenError" &&
		error.message === "invalid signature"
	) {
		return res.status(401).json({ data: `Sorry, your token is invalid!` });
	}

	// JWT Expiration
	if (error.name === "TokenExpiredError" && error.message === "jwt expired") {
		return res.status(401).json({ data: `Sorry, your token is expired!` });
	}

	if (error.name === "JsonWebTokenError" && error.message === "jwt malformed") {
		return res.status(401).json({ data: `Sorry, your token is malformed!` });
	}
};
