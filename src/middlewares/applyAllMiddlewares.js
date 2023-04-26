const applyAppMiddlewares = require("./applyAppMiddlewares");
const applyThirdPartyMiddlewares = require("./applyThirdPartyMiddlewares");
const { errorHandler, successLogger, failureLogger, responseHandler } = require("./index");

/**
 * Configures and applies middlewares to the Express app.
 *
 * @module middleware/configureMiddlewares
 * @param {import('express').Express} app - The Express app instance.
 */
module.exports = (app) => {
	/**
	 * Applies third-party middlewares to the app.
	 */
	applyThirdPartyMiddlewares(app);

	/**
	 * Applies application-specific middlewares to the app.
	 */
	applyAppMiddlewares(app);

	/**
	 * Middleware for logging successful requests.
	 *
	 * @function
	 * @name successLogger
	 * @param {import('express').Request} req - The Express request object.
	 * @param {import('express').Response} res - The Express response object.
	 * @param {import('express').NextFunction} next - The next function in the middleware chain.
	 */
	app.use(successLogger);

	/**
	 * Middleware for logging failed requests.
	 *
	 * @function
	 * @name failureLogger
	 * @param {import('express').Request} req - The Express request object.
	 * @param {import('express').Response} res - The Express response object.
	 * @param {import('express').NextFunction} next - The next function in the middleware chain.
	 */
	app.use(failureLogger);

	/**
	 * Middleware for handling errors.
	 *
	 * @function
	 * @name errorHandler
	 * @param {Error} error - The error object.
	 * @param {import('express').Request} req - The Express request object.
	 * @param {import('express').Response} res - The Express response object.
	 * @param {import('express').NextFunction} next - The next function in the middleware chain.
	 */
	app.use(errorHandler);

	/**
	 * Middleware for handling successful responses.
	 *
	 * @function
	 * @name responseHandler
	 * @param {import('express').Request} req - The Express request object.
	 * @param {import('express').Response} res - The Express response object.
	 */
	app.use(responseHandler);
};
