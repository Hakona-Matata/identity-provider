const AccountServices = require("./../../../domain/modules/account/account.services");

/**
 * Middleware to handle account verification.
 *
 * This middleware function retrieves the account using the `AccountServices.findById()` method
 * and checks the `isVerified` property using the `AccountServices.isAccountVerified()` method.
 * It assigns the retrieved account to `req.account` and calls the `next()` function to pass control to the next middleware in the chain.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 */
module.exports = async (req, res, next) => {
	const account = await AccountServices.findById(req.accountId);

	AccountServices.isAccountVerified(account.isVerified);

	req.account = account;

	next();
};
