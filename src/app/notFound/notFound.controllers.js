const NotFoundException = require("../../Exceptions/common/notFound.exception");

class NotFoundControllers {
	static async notFound(req, res, next) {
		if (!req.result) {
			next(new NotFoundException("Sorry, this endpoint is not found!"));
		} else {
			next();
		}
	}
}

module.exports = NotFoundControllers;
