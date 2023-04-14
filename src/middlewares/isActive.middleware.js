const AccountServices = require("../app/account/account.services");

module.exports = async (req, res, next) => {
	AccountServices.isActive(req.isAccountActive);

	next();
};
