/**
 * Contains methods for handling signup, verify account, login and logout requests.
 *
 * @class
 */

const { validateInput } = require("./../../../shared/helpers");
const AuthValidators = require("./auth.validators");
const AuthServices = require("./auth.services");

class AuthControllers {
	/**
	 * Registers a new account for the user.
	 * @async
	 * @function signUp
	 * @param {Object} req - The request object.
	 * @param {Object} res - The response object.
	 * @param {function} next - The next middleware function.
	 * @returns {void}
	 */
	static async signUp(req, res, next) {
		const accountData = await validateInput(AuthValidators.signUp, req.body);

		res.locals.result = await AuthServices.signUp(accountData);

		next();
	}

	/**
	 * Verifies an account using the provided verification token.
	 * @async
	 * @function verify
	 * @param {Object} req - The request object.
	 * @param {Object} res - The response object.
	 * @param {function} next - The next middleware function.
	 * @returns {void}
	 */
	static async verify(req, res, next) {
		const { verificationToken } = await validateInput(AuthValidators.verify, req.params);

		res.locals.result = await AuthServices.verify(verificationToken);

		next();
	}

	/**
	 * Logs in the user using the provided email and password.
	 * @async
	 * @function logIn
	 * @param {Object} req - The request object.
	 * @param {Object} res - The response object.
	 * @param {function} next - The next middleware function.
	 * @returns {void}
	 */
	static async logIn(req, res, next) {
		const { email, password } = await validateInput(AuthValidators.login, req.body);

		res.locals.result = await AuthServices.logIn({ email, password });

		next();
	}

	/**
	 * Logs out the user using the provided accountId and accessToken.
	 * @async
	 * @function logOut
	 * @param {Object} req - The request object.
	 * @param {Object} res - The response object.
	 * @param {function} next - The next middleware function.
	 * @returns {void}
	 */
	static async logOut(req, res, next) {
		res.locals.result = await AuthServices.logOut({
			accountId: req.accountId,
			accessToken: req.accessToken,
		});

		next();
	}
}

module.exports = AuthControllers;
