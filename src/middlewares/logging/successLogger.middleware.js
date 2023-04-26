module.exports = async (error, req, res, next) => {
	// TODO: Log every critical operation or whatever you want!
	// TODO: Use our Logging API (I'll create it soon!)

	if (error) {
		return next(error);
	} else {
		console.log("from success logger");

		next();
	}
};
