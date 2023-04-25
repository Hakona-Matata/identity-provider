module.exports = async (error, req, res, next) => {
	// TODO: Log whatever occurring error here! (We will talk to the logging API)
	// TODO: About to create it soon!

	// console.log("from failure logger");

	next(error);
};
