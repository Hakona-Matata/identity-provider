const AccountServices = require("../../../domain/modules/account/account.services");

/**
 * Middleware to check if the account is active.
 *
 * This middleware function checks the `isActive` property of the `req.account` object
 * using the `AccountServices.isAccountActive()` method.
 * It doesn't return any value and calls the `next()` function to pass control to the next middleware in the chain.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {void}
 */
module.exports = async (req, res, next) => {
	AccountServices.isAccountActive(req.account.isActive);

	next();
};
