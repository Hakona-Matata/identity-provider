/**
 * PasswordControllers is a class that handles password-related API requests.
 * @class
 */
const validate = require("../../helpers/validateInput");
const PasswordValidators = require("./password.validators");
const PasswordServices = require("./password.services");

class PasswordControllers {
	/**
	 * Method for changing the password of the logged-in user.
	 * @async
	 * @static
	 * @method
	 * @param {object} req - The request object.
	 * @param {object} res - The response object.
	 * @param {function} next - The next function.
	 * @throws {BadRequestException} If the input data is invalid.
	 * @returns {Promise<void>} Nothing.
	 */
	static async change(req, res, next) {
		const passwordData = await validate(PasswordValidators.change, req.body);

		req.result = await PasswordServices.change({
			accountId: req.accountId,
			accountPassword: req.accountPassword,
			...passwordData,
		});

		next();
	}

	/**
	 * Method for requesting a password reset email.
	 * @async
	 * @static
	 * @method
	 * @param {object} req - The request object.
	 * @param {object} res - The response object.
	 * @param {function} next - The next function.
	 * @throws {BadRequestException} If the input data is invalid.
	 * @returns {Promise<void>} Nothing.
	 */
	static async forget(req, res, next) {
		const { email } = await validate(PasswordValidators.forget, req.body);

		req.result = await PasswordServices.forget(email);

		next();
	}

	/**
	 * Method for resetting the password of an account using a reset token.
	 * @async
	 * @static
	 * @method
	 * @param {object} req - The request object.
	 * @param {object} res - The response object.
	 * @param {function} next - The next function.
	 * @throws {BadRequestException} If the input data is invalid.
	 * @returns {Promise<void>} Nothing.
	 */
	static async reset(req, res, next) {
		const resetAccountData = await validate(PasswordValidators.reset, req.body);

		req.result = await PasswordServices.reset(resetAccountData);

		next();
	}
}

module.exports = PasswordControllers;
