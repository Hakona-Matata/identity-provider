const isAuthenticated = require("./isAuthenticated.middleware");
const isVerified = require("./isVerified.middleware");
const isActive = require("./isActive.middleware");
const isNotDeleted = require("./isNotDeleted.middleware");

// ** Need to be used in the same order!

module.exports = {
	isAuthenticated,
	isVerified,
	isActive,
	isNotDeleted,
};
