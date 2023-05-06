const { NotFoundException } = require("../../../shared/exceptions");

/**
 * Class representing a middleware for handling 404 (Not Found) errors in the application.
 *
 * @class
 */
class NotFoundControllers {
	/**
	 * Middleware function to handle 404 errors. If no result is found in the request object,
	 * it will throw a NotFoundException with a message indicating that the endpoint was not found.
	 *
	 * @param {Object} req - Express request object containing the request data.
	 * @param {Object} res - Express response object for sending the response to the client.
	 * @param {Function} next - Express next middleware function for passing control to the next middleware or route handler.
	 * @throws {NotFoundException} - Throws a NotFoundException if no result is found in the request object.
	 */
	static async notFound(req, res, next) {
		if (!req.result) {
			next(new NotFoundException("Sorry, this endpoint is not found!"));
		} else {
			next();
		}
	}
}

module.exports = NotFoundControllers;
