const { isVerified, isActive } = require("./account/index");
const { isAuthenticated, restrictedTo } = require("./auth/index");
const { errorHandler } = require("./errors/index");
const { successLogger, failureLogger } = require("./logging/index");

module.exports = {
	isAuthenticated,
	isVerified,
	isActive,
	restrictedTo,
	errorHandler,
	successLogger,
	failureLogger,
};
