const AccountServices = require("../app/account/account.services");

module.exports = async (req, res, next) => {
	console.log("isActive");

	AccountServices.isActive(req.isAccountActive);

	next();
};
