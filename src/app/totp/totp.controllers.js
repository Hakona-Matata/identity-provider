/**
 * @class
 * @classdesc Controller class for handling TOTP related operations
 */
const validateInput = require("../../helpers/validateInput");

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
		req.result = await TotpServices.initiateEnabling(req.account._id, req.account.ist);
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
		req.result = await TotpServices.confirmEnabling(req.account._id, totp, req.account.isTotpEnabled);
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
		req.result = await TotpServices.disable(req.account._id, req.account.isTotpEnabled);
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
		req.result = await TotpServices.verify(accountId, totp);
		next();
	}
}

module.exports = TotpControllers;
