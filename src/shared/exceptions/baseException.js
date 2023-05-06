/**
 * Base class for custom application exceptions.
 * @class
 * @extends Error
 */
module.exports = class BaseException extends Error {
	/**
	 * @constructor
	 * @param {number} statusCode - HTTP status code number.
	 * @param {string} statusCode - HTTP status code string.
	 * @param {string} errorMessage - Exception message.
	 */
	constructor(statusCode, statusMessage, errorMessage) {
		super(errorMessage);

		/**
		 * Error code.
		 *
		 * @type {number}
		 */
		this.statusCode = statusCode;

		/**
		 * HTTP status code.
		 *
		 * @type {string}
		 */
		this.statusMessage = statusMessage;

		/**
		 * Exception message.
		 *
		 * @type {string}
		 */
		this.errorMessage = errorMessage;
	}
};
