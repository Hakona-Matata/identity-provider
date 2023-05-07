/**
 * SmsControllers class which contains functions to handle sms-related HTTP requests
 */

const { validateInput } = require("./../../../shared/helpers");
const SmsValidators = require("./sms.validators");
const SmsServices = require("./sms.services");

class SmsControllers {
	/**
	 * Enable the SMS OTP feature for an account
	 * @async
	 * @param {object} req - Express request object
	 * @param {object} res - Express response object
	 * @param {function} next - Express next middleware function
	 * @returns {void}
	 */
	static async enable(req, res, next) {
		const {
			phone: { phone, country },
		} = await validateInput(SmsValidators.enable, req.body);

		res.locals.result = await SmsServices.enable({
			accountId: req.accountId,
			isSmsEnabled: req.account.isSmsEnabled,
			phone,
			country,
		});

		next();
	}

	/**
	 * Confirm the received OTP code for an account
	 * @async
	 * @param {object} req - Express request object
	 * @param {object} res - Express response object
	 * @param {function} next - Express next middleware function
	 * @returns {void}
	 */
	static async confirm(req, res, next) {
		const { otp } = await validateInput(SmsValidators.confirm, req.body);

		res.locals.result = await SmsServices.confirm(req.accountId, otp);

		next();
	}

	/**
	 * Disable the SMS OTP feature for an account
	 * @async
	 * @param {object} req - Express request object
	 * @param {object} res - Express response object
	 * @param {function} next - Express next middleware function
	 * @returns {void}
	 */
	static async disable(req, res, next) {
		res.locals.result = await SmsServices.disable(req.accountId, req.account.isSmsEnabled);

		next();
	}

	/**
	 * Verify a given OTP code for an account
	 * @async
	 * @param {object} req - Express request object
	 * @param {object} res - Express response object
	 * @param {function} next - Express next middleware function
	 * @returns {void}
	 */
	static async verify(req, res, next) {
		const { accountId, otp } = await validateInput(SmsValidators.verify, req.body);

		res.locals.result = await SmsServices.verify({
			accountId,
			givenOtp: otp,
		});

		next();
	}
}

module.exports = SmsControllers;
