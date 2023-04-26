/**
 * This module defines the routes for handling account-related requests.
 * @module
 */
const express = require("express");

const {
	deactivate,
	initiateActivation,
	confirmActivation,
	terminate,
	cancelTermination,
} = require("./account.controllers");
const { isAuthenticated, isVerified, isActive } = require("./../../middlewares/index");

/**
 * Router instance for handling account-related routes
 * @type {express.Router}
 */
const router = express.Router();

/**
 * Deactivates the authenticated user's account
 * @name PUT/auth/account/deactivate
 * @function
 * @memberof module:routers/accountRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback[]} middleware - Express middleware
 * @param {callback} middleware[0] - isAuthenticated middleware function
 * @param {callback} middleware[1] - isVerified middleware function
 * @param {callback} middleware[2] - AccountControllers.deactivate middleware function
 */
router.route("/deactivate").put([isAuthenticated, isVerified], deactivate);

/**
 * Initiates the activation process for a user account
 * @name PUT/auth/account/activate
 * @function
 * @memberof module:routers/accountRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback[]} middleware - Express middleware
 * @param {callback} middleware[0] - AccountControllers.initiateActivation middleware function
 */
router.route("/activate").put(initiateActivation);

/**
 * Confirms the activation of a user account
 * @name GET/auth/account/activate/:activationToken
 * @function
 * @memberof module:routers/accountRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback[]} middleware - Express middleware
 * @param {callback} middleware[0] - AccountControllers.confirmActivation middleware function
 */
router.route("/activate/:activationToken").get(confirmActivation);

/**
 * Terminates the authenticated user's account
 * @name DELETE/auth/account/delete
 * @function
 * @memberof module:routers/accountRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback[]} middleware - Express middleware
 * @param {callback} middleware[0] - isAuthenticated middleware function
 * @param {callback} middleware[1] - isVerified middleware function
 * @param {callback} middleware[2] - isActive middleware function
 * @param {callback} middleware[3] - AccountControllers.terminate middleware function
 */
router.route("/delete").delete([isAuthenticated, isVerified, isActive], terminate);

/**
 * Cancels the termination process of the authenticated user's account
 * @name PUT/auth/account/cancel-delete
 * @function
 * @memberof module:routers/accountRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback[]} middleware - Express middleware
 * @param {callback} middleware[0] - isAuthenticated middleware function
 * @param {callback} middleware[1] - isVerified middleware function
 * @param {callback} middleware[2] - isActive middleware function
 * @param {callback} middleware[3] - AccountControllers.cancelTermination middleware function
 */
router.route("/cancel-delete").put([isAuthenticated, isVerified, isActive], cancelTermination);

module.exports = router;
