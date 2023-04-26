const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../constants/index");

/**
 * Response handler middleware for sending successful responses.
 *
 * @module middleware/responseHandler
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
module.exports = async (req, res) => {
	// TODO: Consider logging everything like originalUrl, params, query, body, method, etc...
	// TODO: (Be careful of injection attacks during this desired implementation!)

	/**
	 * @typedef {Object} SuccessResponse
	 * @property {boolean} success - Indicates if the request was successful.
	 * @property {number} status - The status code of the response.
	 * @property {string} code - The status code string representation.
	 * @property {*} result - The result data to be included in the response.
	 */

	/**
	 * The success response object.
	 * @type {SuccessResponse}
	 */
	const response = {
		success: true,
		status: httpStatusCodeNumbers.OK,
		code: httpStatusCodeStrings.OK,
		result: req.result,
	};

	res.status(httpStatusCodeNumbers.OK).json(response);
};
