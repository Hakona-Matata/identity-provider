const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../constants/index");

module.exports = async (req, res, next) => {
	// TODO: Consider logging everything like originalUrl, params, query, body,method, etc...
	// TODO: (Be careful of injection attacks during this desired implementation!)
	// console.log("from Response Handler");

	res.status(httpStatusCodeNumbers.OK).json({
		success: true,
		status: httpStatusCodeNumbers.OK,
		code: httpStatusCodeStrings.OK,
		result: req.result,
	});
};
