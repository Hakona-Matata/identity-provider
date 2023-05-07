/**
 * Controller class for managing backup codes.
 */
const { validateInput } = require("./../../../shared/helpers");
const BackupValidators = require("./backup.validators");
const BackupServices = require("./backup.services");

class BackupControllers {
	/**
	 * Initiate enabling backup codes for an account.
	 * @async
	 * @static
	 * @param {Object} req - The HTTP request object.
	 * @param {Object} req.account - The account object attached to the request.
	 * @param {Object} res - The HTTP response object.
	 * @param {Function} next - The next middleware function.
	 * @returns {void}
	 */
	static async initiateEnabling(req, res, next) {
		res.locals.result = await BackupServices.initiateEnabling(req.account);
		next();
	}

	/**
	 * Confirm enabling backup codes for an account with a provided code.
	 * @async
	 * @static
	 * @param {Object} req - The HTTP request object.
	 * @param {Object} req.account - The account object attached to the request.
	 * @param {Object} req.body - The request body object containing the confirmation code.
	 * @param {string} req.body.code - The backup code confirmation code.
	 * @param {Object} res - The HTTP response object.
	 * @param {Function} next - The next middleware function.
	 * @returns {void}
	 */
	static async confirmEnabling(req, res, next) {
		const { code } = await validateInput(BackupValidators.confirm, req.body);
		res.locals.result = await BackupServices.confirmEnabling(req.account, code);
		next();
	}

	/**
	 * Disable backup codes for an account.
	 * @async
	 * @static
	 * @param {Object} req - The HTTP request object.
	 * @param {Object} req.account - The account object attached to the request.
	 * @param {Object} res - The HTTP response object.
	 * @param {Function} next - The next middleware function.
	 * @returns {void}
	 */
	static async disable(req, res, next) {
		res.locals.result = await BackupServices.disable(req.account);
		next();
	}

	/**
	 * Regenerate backup codes for an account.
	 * @async
	 * @static
	 * @param {Object} req - The HTTP request object.
	 * @param {Object} req.account._id - The ID of the account object attached to the request.
	 * @param {Object} res - The HTTP response object.
	 * @param {Function} next - The next middleware function.
	 * @returns {void}
	 */
	static async regenerate(req, res, next) {
		res.locals.result = await BackupServices.regenerate(req.account._id);
		next();
	}

	/**
	 * Verify a backup code for a given email.
	 * @async
	 * @static
	 * @param {Object} req - The HTTP request object.
	 * @param {Object} req.body - The request body object containing the email and backup code.
	 * @param {string} req.body.email - The email of the account associated with the backup code.
	 * @param {string} req.body.code - The backup code to verify.
	 * @param {Object} res - The HTTP response object.
	 * @param {Function} next - The next middleware function.
	 * @returns {void}
	 */

	static async recover(req, res, next) {
		const { email, code } = await validateInput(BackupValidators.recover, req.body);

		res.locals.result = await BackupServices.recover({ email, code });

		next();
	}
}

module.exports = BackupControllers;
