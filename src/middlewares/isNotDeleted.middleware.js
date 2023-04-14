const AccountServices = require("../app/account/account.services");

module.exports = async (req, res, next) => {
	console.log("isNotDeleted");

	AccountServices.isNotDeleted(req.isAccountDeleted);

	next();
};
