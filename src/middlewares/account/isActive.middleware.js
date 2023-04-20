const AccountServices = require("../../app/account/account.services");

module.exports = async (req, res, next) => {
	AccountServices.isAccountActive(req.account.isActive);

	next();
};
