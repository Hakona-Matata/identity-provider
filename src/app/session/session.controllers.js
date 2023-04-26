/**
 * Controllers for handling session related requests
 * 
 * @class
 */
const validate = require("../../helpers/validateInput");
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
		req.result = await SessionServices.findMany({ accountId: req.accountId });
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
		const { sessionId } = await validate(SessionValidators.cancel, req.body);
		req.result = await SessionServices.cancel({ accountId: req.accountId, sessionId });
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
		const { refreshToken } = await validate(SessionValidators.renew, req.body);
		req.result = await SessionServices.renew(refreshToken);
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
		const { accessToken } = await validate(SessionValidators.validate, req.body);
		req.result = await SessionServices.validate(accessToken);
		next();
	}
}

module.exports = SessionControllers;
