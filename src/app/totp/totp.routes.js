/**
 * Express Router for the TOTP feature endpoints
 * @module routers/totp
 */

const express = require("express");

const { initiateEnabling, confirmEnabling, disable, verify } = require("./totp.controllers");
const { isAuthenticated, isVerified, isActive } = require("./../../middlewares/index");

const router = express.Router();

/**
 * Route for initiating the TOTP enabling process
 * @name post/enable
 * @function
 * @memberof module:routers/totp
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @param {callback} middleware - Controller method.
 */
router.route("/enable").post([isAuthenticated, isVerified, isActive], initiateEnabling);

/**
 * Route for confirming the TOTP enabling process
 * @name post/confirm
 * @function
 * @memberof module:routers/totp
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @param {callback} middleware - Controller method.
 */
router.route("/confirm").post([isAuthenticated, isVerified, isActive], confirmEnabling);

/**
 * Route for disabling the TOTP feature
 * @name delete/disable
 * @function
 * @memberof module:routers/totp
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @param {callback} middleware - Controller method.
 */
router.route("/disable").delete([isAuthenticated, isVerified, isActive], disable);

/**
 * Route for verifying a TOTP code
 * @name post/verify
 * @function
 * @memberof module:routers/totp
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Controller method.
 */
router.route("/verify").post(verify);

module.exports = router;
