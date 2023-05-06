const isAuthenticated = require("./isAuthenticated.middleware");
const restrictedTo = require("./restrictedTo.middleware");

module.exports = { isAuthenticated, restrictedTo };
