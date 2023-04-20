const isAuthenticated = require("./auth/isAuthenticated.middleware");
const isVerified = require("./isVerified.middleware");
const isActive = require("./isActive.middleware");

// ** Need to be used in the same order!

module.exports = {
	isAuthenticated,
	isVerified,
	isActive,
};
