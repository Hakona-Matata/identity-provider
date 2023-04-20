module.exports = (error, req, res, next) => {
	// TODO: Log every critical operation or whatever you want!
	// TODO: Use our Logging API (I'll create it soon!)

	if (error) {
		return next(error);
	}

	// Save the request and response stuff
	console.log({ res });
	console.log("--------------------------------------------------");
	console.log("from sucess logger");
	console.log("--------------------------------------------------");
};
