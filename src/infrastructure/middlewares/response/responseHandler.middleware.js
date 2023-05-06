const { httpStatusCodes, httpStatusMessages } = require("./../../../shared/constants");

/**
 * Response handler middleware for sending successful responses.
 *
 * @module middleware/responseHandler
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
module.exports = async (req, res) => {
	/**
	 * @typedef {Object}
	 * @property {boolean} success - Indicates if the request was successful.
	 * @property {number} status - The status code of the response.
	 * @property {string} code - The status code string representation.
	 * @property {*} result - The result data to be included in the response.
	 */

	res.status(httpStatusCodes.OK).json({
		success: true,
		status: httpStatusCodes.OK,
		code: httpStatusMessages.OK,
		result: req.result,
	});
};
