/**
 * OtpControllers is responsible for handling the OTP functionality in the application.
 * 
 * @class
 */
const validateInput = require("../../helpers/validateInput");

const OtpValidators = require("./otp.validators");
const OtpServices = require("./otp.services");

class OtpControllers {
	/**
	 * Middleware function to enable OTP feature for a user account.
	 *
	 * @param {Object} req - Express request object.
	 * @param {Object} res - Express response object.
	 * @param {Function} next - Express next middleware function.
	 * @throws {Error} - Throws an error if the OTP enabling process fails.
	 */
	static async enable(req, res, next) {
		req.result = await OtpServices.enable(req.account._id, req.account.isOtpEnabled);

		next();
	}

	/**
	 * Middleware function to confirm the OTP code sent to the user's mailbox.
	 *
	 * @param {Object} req - Express request object.
	 * @param {Object} res - Express response object.
	 * @param {Function} next - Express next middleware function.
	 * @throws {Error} - Throws an error if the OTP confirmation process fails.
	 */
	static async confirm(req, res, next) {
		const { otp } = await validateInput(OtpValidators.confirm, req.body);

		req.result = await OtpServices.confirm(req.account._id, otp);

		next();
	}

	/**
	 * Middleware function to disable OTP feature for a user account.
	 *
	 * @param {Object} req - Express request object.
	 * @param {Object} res - Express response object.
	 * @param {Function} next - Express next middleware function.
	 * @throws {Error} - Throws an error if the OTP disabling process fails.
	 */
	static async disable(req, res, next) {
		req.result = await OtpServices.disable(req.accountId, req.account.isOtpEnabled);

		next();
	}

	/**
	 * Middleware function to verify the OTP code entered by the user.
	 *
	 * @param {Object} req - Express request object.
	 * @param {Object} res - Express response object.
	 * @param {Function} next - Express next middleware function.
	 * @throws {Error} - Throws an error if the OTP verification process fails.
	 */
	static async verify(req, res, next) {
		const { accountId, otp } = await validateInput(OtpValidators.verify, req.body);

		req.result = await OtpServices.verify(accountId, otp);

		next();
	}
}

module.exports = OtpControllers;
