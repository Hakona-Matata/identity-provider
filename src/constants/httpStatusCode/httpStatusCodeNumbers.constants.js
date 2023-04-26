/**
 * HTTP status codes.
 *
 * @namespace httpStatusCodes
 * @property {number} OK - 200
 * @property {number} CREATED - 201
 * @property {number} MOVED_PERMANENTLY - 301
 * @property {number} MOVED_TEMPORARILY - 302
 * @property {number} TEMPORARY_REDIRECT - 307
 * @property {number} PERMANENT_REDIRECT - 308
 * @property {number} BAD_REQUEST - 400
 * @property {number} UNAUTHORIZED - 401
 * @property {number} FORBIDDEN - 403
 * @property {number} NOT_FOUND - 404
 * @property {number} METHOD_NOT_ALLOWED - 405
 * @property {number} REQUEST_TIMEOUT - 408
 * @property {number} REQUEST_TOO_LONG - 413
 * @property {number} REQUEST_URI_TOO_LONG - 414
 * @property {number} UNPROCESSABLE_ENTITY - 422
 * @property {number} TOO_MANY_REQUESTS - 429
 * @property {number} INTERNAL_SERVER_ERROR - 500
 * @property {number} BAD_GATEWAY - 502
 * @property {number} SERVICE_UNAVAILABLE - 503
 * @property {number} GATEWAY_TIMEOUT - 504
 * @property {number} HTTP_VERSION_NOT_SUPPORTED - 505
 */

module.exports = {
	OK: 200,
	CREATED: 201,
	MOVED_PERMANENTLY: 301,
	MOVED_TEMPORARILY: 302,
	TEMPORARY_REDIRECT: 307,
	PERMANENT_REDIRECT: 308,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	REQUEST_TIMEOUT: 408,
	REQUEST_TOO_LONG: 413,
	REQUEST_URI_TOO_LONG: 414,
	UNPROCESSABLE_ENTITY: 422,
	TOO_MANY_REQUESTS: 429,
	INTERNAL_SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
	GATEWAY_TIMEOUT: 504,
	HTTP_VERSION_NOT_SUPPORTED: 505,
};
