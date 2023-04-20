const AccountServices = require("./../../app/account/account.services");

module.exports = async (req, res, next) => {
	const account = await AccountServices.findById(req.accountId);

	AccountServices.isAccountVerified(account.isVerified);

	req.account = account;

	next();
};
