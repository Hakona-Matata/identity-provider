/**
 * Express router providing session related routes.
 * 
 * @module routes/session
 */

const express = require("express");

const { findAll, cancel, renew, validate } = require("./session.controllers");
const { isAuthenticated, isVerified, isActive ,isNotDeleted} = require("./../../middlewares/index");

/**
 * Express router to mount session related functions on.
 * @type {object}
 * @const
 * @namespace sessionRouter
 */

const router = express.Router();

/**
 * Route serving to find all sessions associated with the authenticated account.
 * @name get/sessions
 * @function
 * @memberof module:routes/session~sessionRouter
 * @inner
 * @param {function} middleware - isAuthenticated middleware function.
 * @param {function} middleware - isVerified middleware function.
 * @param {function} middleware - isActive middleware function.
 * @param {Callback} controller - findAll controller function.
 */

router
	.route("/")
	.get([isAuthenticated, isVerified, isNotDeleted, isActive], findAll)
	/**
	 * Route serving to cancel an active session of an authenticated account.
	 * @name post/sessions
	 * @function
	 * @memberof module:routes/session~sessionRouter
	 * @inner
	 * @param {function} middleware - isAuthenticated middleware function.
	 * @param {function} middleware - isVerified middleware function.
	 * @param {function} middleware - isActive middleware function.
	 * @param {Callback} controller - cancel controller function.
	 */
	.post([isAuthenticated, isVerified, isNotDeleted, isActive], cancel);

/**
 * Route serving to renew an expired access token.
 * @name post/sessions/renew
 * @function
 * @memberof module:routes/session~sessionRouter
 * @inner
 * @param {Callback} controller - renew controller function.
 */

router.route("/renew").post(renew);

/**
 * Route serving to validate an access token.
 * @name post/sessions/validate
 * @function
 * @memberof module:routes/session~sessionRouter
 * @inner
 * @param {Callback} controller - validate controller function.
 */

router.route("/validate").post(validate);

module.exports = router;
