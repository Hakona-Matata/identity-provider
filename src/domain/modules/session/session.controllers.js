/**
 * Controllers for handling session related requests
 * 
 * @class
 */

const { validateInput } = require("./../../../shared/helpers");
const SessionValidators = require("./session.validators");
const SessionServices = require("./session.services");

class SessionControllers {
	/**
	 * Find all sessions of the logged in account
	 * @function
	 * @async
	 * @param {object} req - Request object
	 * @param {object} res - Response object
	 * @param {function} next - Express next middleware function
	 * @returns {Promise<void>} - Promise representing the completion of this request
	 */
	static async findAll(req, res, next) {
		res.locals.result = await SessionServices.findMany({ accountId: req.accountId });
		next();
	}

	/**
	 * Cancel a session
	 * @function
	 * @async
	 * @param {object} req - Request object
	 * @param {object} res - Response object
	 * @param {function} next - Express next middleware function
	 * @returns {Promise<void>} - Promise representing the completion of this request
	 */
	static async cancel(req, res, next) {
		const { sessionId } = await validateInput(SessionValidators.cancel, req.body);
		res.locals.result = await SessionServices.cancel({ accountId: req.accountId, sessionId });
		next();
	}

	/**
	 * Renew a session
	 * @function
	 * @async
	 * @param {object} req - Request object
	 * @param {object} res - Response object
	 * @param {function} next - Express next middleware function
	 * @returns {Promise<void>} - Promise representing the completion of this request
	 */
	static async renew(req, res, next) {
		const { refreshToken } = await validateInput(SessionValidators.renew, req.body);
		res.locals.result = await SessionServices.renew(refreshToken);
		next();
	}

	/**
	 * Validate a session
	 * @function
	 * @async
	 * @param {object} req - Request object
	 * @param {object} res - Response object
	 * @param {function} next - Express next middleware function
	 * @returns {Promise<void>} - Promise representing the completion of this request
	 */
	static async validate(req, res, next) {
		const { accessToken } = await validateInput(SessionValidators.validate, req.body);
		res.locals.result = await SessionServices.validate(accessToken);
		next();
	}
}

module.exports = SessionControllers;
