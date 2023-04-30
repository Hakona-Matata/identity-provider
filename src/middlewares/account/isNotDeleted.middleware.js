const AccountServices = require("./../../app/account/account.services");

/**
 * Middleware to check if the account is deleted based on the `isDeleted` flag from the request's account object.
 * Proceeds to the next middleware.
 *
 * @param {import('express').Request} req - The Express request object
 * @param {import('express').Response} res - The Express response object
 * @param {import('express').NextFunction} next - The next middleware function
 */

module.exports = async (req, res, next) => {
	AccountServices.isAccountDeleted(req.account.isDeleted);

	next();
};
