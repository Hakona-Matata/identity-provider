/**
 * Base class for custom application exceptions.
 * @class
 * @extends Error
 */
module.exports = class BaseAppException extends Error {
	/**
	 * @constructor
	 * @param {string} errorCode - Error code.
	 * @param {number} statusCode - HTTP status code.
	 * @param {string} message - Exception message.
	 */
	constructor(errorCode, statusCode, message) {
		super(message);

		/**
		 * Error code.
		 *
		 * @type {string}
		 */
		this.errorCode = errorCode;

		/**
		 * HTTP status code.
		 *
		 * @type {number}
		 */
		this.statusCode = statusCode;

		/**
		 * Exception message.
		 *
		 * @type {string}
		 */
		this.message = message;
	}
};
