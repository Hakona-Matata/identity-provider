const { validateInput } = require("../../../shared/helpers");
const AccountValidators = require("./account.validators");
const AccountServices = require("./account.services");

/**
 * Controller methods for account-related endpoints
 * @class
 */
class AccountControllers {
	/**
	 * Deactivates an account
	 * @async
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @param {function} next - Express next middleware function
	 */
	static async deactivate(req, res, next) {
		req.result = await AccountServices.deactivate(req.accountId);

		next();
	}

	/**
	 * Initiates the account activation process
	 * @async
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @param {function} next - Express next middleware function
	 */
	static async initiateActivation(req, res, next) {
		const { email } = await validateInput(AccountValidators.activate, req.body);

		req.result = await AccountServices.initiateActivation(email);

		next();
	}

	/**
	 * Confirms the account activation process
	 * @async
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @param {function} next - Express next middleware function
	 */
	static async confirmActivation(req, res, next) {
		const { activationToken } = await validateInput(AccountValidators.confirmActivation, req.params);

		req.result = await AccountServices.confirmActivation(activationToken);

		next();
	}

	/**
	 * Terminates an account
	 * @async
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @param {function} next - Express next middleware function
	 */
	static async terminate(req, res, next) {
		req.result = await AccountServices.terminate(req.accountId);

		next();
	}

	/**
	 * Cancels the account termination process
	 * @async
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @param {function} next - Express next middleware function
	 */
	static async cancelTermination(req, res, next) {
		const { email } = await validateInput(AccountValidators.cancel, req.body);

		req.result = await AccountServices.cancelTermination(email);

		next();
	}
}

module.exports = AccountControllers;
