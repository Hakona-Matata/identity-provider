/**
 * Express router instance for password related endpoints.
 *
 * @module routers/password
 */

const express = require("express");

const { change, forget, reset } = require("./password.controllers");
const { isAuthenticated, isVerified, isActive, isNotDeleted } = require("./../../../infrastructure/middlewares");

const router = express.Router();

/**
 * Route to change the password of the authenticated user.
 * @name put/change
 * @function
 * @memberof module:routers/password
 * @inner
 * @param {function} isAuthenticated - Middleware function to check if user is authenticated.
 * @param {function} isVerified - Middleware function to check if user is verified.
 * @param {function} isActive - Middleware function to check if user account is active.
 * @param {function} change - Controller function to handle the request.
 */
router.route("/change").put([isAuthenticated, isVerified, isNotDeleted, isActive], change);

/**
 * Route to request a password reset link by email.
 * @name post/forget
 * @function
 * @memberof module:routers/password
 * @inner
 * @param {function} forget - Controller function to handle the request.
 */
router.route("/forget").post(forget);

/**
 * Route to reset the password by providing reset link and new password.
 * @name put/reset
 * @function
 * @memberof module:routers/password
 * @inner
 * @param {function} reset - Controller function to handle the request.
 */
router.route("/reset").put(reset);

module.exports = router;
