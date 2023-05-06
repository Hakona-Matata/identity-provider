/**
 * A module that exports an Express router for handling signup, verify account, login and logout HTTP requests.
 * @module routes/auth
 */

const express = require("express");

const { signUp, verify, logIn, logOut } = require("./auth.controllers");
const { isAuthenticated, isVerified, isNotDeleted, isActive } = require("./../../../infrastructure/middlewares");

const router = express.Router();

/**
 * Route that handles HTTP POST requests for user sign-up.
 * @name post/auth/sign-up
 * @function
 * @memberof module:routes/auth
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body object, which contains the user's account data.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next function middleware to be executed.
 * @returns {undefined}
 */
router.route("/sign-up").post(signUp);

/**
 * Route that handles HTTP GET requests for email verification.
 * @name get/auth/verify-email/:verificationToken
 * @function
 * @memberof module:routes/auth
 * @param {Object} req - The HTTP request object.
 * @param {string} req.params.verificationToken - The verification token sent to the user's email.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next function middleware to be executed.
 * @returns {undefined}
 */
router.route("/verify-email/:verificationToken").get(verify);

/**
 * Route that handles HTTP POST requests for user login.
 * @name post/auth/login
 * @function
 * @memberof module:routes/auth
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body object, which contains the user's email and password.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next function middleware to be executed.
 * @returns {undefined}
 */
router.route("/login").post(logIn);

/**
 * Route that handles HTTP POST requests for user logout.
 * @name post/auth/logout
 * @function
 * @memberof module:routes/auth
 * @param {Object} req - The HTTP request object.
 * @param {string} req.accountId - The ID of the logged-in user's account.
 * @param {string} req.accessToken - The access token of the logged-in user's session.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next function middleware to be executed.
 * @returns {undefined}
 */
router.route("/logout").post([isAuthenticated, isVerified, isNotDeleted, isActive], logOut);

module.exports = router;
