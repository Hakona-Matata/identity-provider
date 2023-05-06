const { isVerified, isActive, isNotDeleted } = require("./account/index");
const { isAuthenticated, restrictedTo } = require("./auth/index");
const { errorHandler } = require("./errors/index");
const { successLogger, failureLogger } = require("./logging/index");
const { responseHandler } = require("./response/index");

module.exports = {
	isAuthenticated,
	isVerified,
	isActive,
	isNotDeleted,
	restrictedTo,
	errorHandler,
	successLogger,
	failureLogger,
	responseHandler,
};
