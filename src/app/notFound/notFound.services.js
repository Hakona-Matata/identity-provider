const NotFoundException = require("./../../Exceptions/common/notFound.exception");

class NotFoundServices {
	static async notFound() {
		throw new NotFoundException("Sorry, this endpoint is not found!");
	}
}

module.exports = NotFoundServices;
