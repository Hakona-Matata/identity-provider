const { failure } = require("../../Exceptions/responseHandler");

module.exports = (error, req, res, next) => {
	// TODO: This should handle whatever error happens in our app!

	console.log("from Error Handler");

	if (error) {
		return failure({ res, error });
	}

	next();
};
