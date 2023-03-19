const crypto = require("crypto");

module.exports = function () {
	return crypto.randomBytes(20).toString("hex");
};
