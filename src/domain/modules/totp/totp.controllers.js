/**
 * @class
 * @classdesc Controller class for handling TOTP related operations
 */

const { validateInput } = require("./../../../shared/helpers");
const TotpValidators = require("./totp.validators");
const TotpServices = require("./totp.services");

class TotpControllers {
	/**
	 * @async
	 * @static
	 * @method
	 * @desc Initiates the enabling of TOTP
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @param {Function} next - Express next middleware function
	 * @returns {void}
	 */
	static async initiateEnabling(req, res, next) {
		res.locals.result = await TotpServices.initiateEnabling(req.account._id, req.account.isTotpEnabled);
		next();
	}

	/**
	 * @async
	 * @static
	 * @method
	 * @desc Confirms the enabling of TOTP
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @param {Function} next - Express next middleware function
	 * @returns {void}
	 */
	static async confirmEnabling(req, res, next) {
		const { totp } = await validateInput(TotpValidators.confirm, req.body);
		res.locals.result = await TotpServices.confirmEnabling(req.account._id, totp, req.account.isTotpEnabled);
		next();
	}

	/**
	 * @async
	 * @static
	 * @method
	 * @desc Disables the TOTP feature
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @param {Function} next - Express next middleware function
	 * @returns {void}
	 */
	static async disable(req, res, next) {
		res.locals.result = await TotpServices.disable(req.account._id, req.account.isTotpEnabled);
		next();
	}

	/**
	 * @async
	 * @static
	 * @method
	 * @desc Verifies the TOTP code
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @param {Function} next - Express next middleware function
	 * @returns {void}
	 */
	static async verify(req, res, next) {
		const { accountId, totp } = await validateInput(TotpValidators.verify, req.body);
		res.locals.result = await TotpServices.verify(accountId, totp);
		next();
	}
}

module.exports = TotpControllers;
