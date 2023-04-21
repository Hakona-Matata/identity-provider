const { roles } = require("./account/index");
const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./httpStatusCode/index");
const { tokens } = require("./tokens/index");
const IDENTITY_PROVIDER = "IDENTITY_PROVIDER";

module.exports = {
	roles,
	httpStatusCodeStrings,
	httpStatusCodeNumbers,
	tokens,
	IDENTITY_PROVIDER,
};
