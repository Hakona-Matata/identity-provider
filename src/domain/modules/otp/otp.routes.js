/**
 * Express router for managing OTP-related endpoints.
 * @module otpRouter
 */

const express = require("express");

const { enable, confirm, disable, verify } = require("./otp.controllers");
const { isAuthenticated, isVerified, isActive, isNotDeleted } = require("./../../../infrastructure/middlewares");

const router = express.Router();

/**
 * Enable OTP for a user account.
 *
 * @name GET/api/otp/enable
 * @function
 * @memberof module:otpRouter
 * @inner
 * @param {Object} req - Express request object.
 * @param {Object} req.account - The user account object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
router.route("/enable").get([isAuthenticated, isVerified, isNotDeleted, isActive], enable);

/**
 * Confirm OTP code for a user account.
 *
 * @name POST/api/otp/confirm
 * @function
 * @memberof module:otpRouter
 * @inner
 * @param {Object} req - Express request object.
 * @param {Object} req.account - The user account object.
 * @param {Object} req.body - The request body containing the OTP code.
 * @param {string} req.body.otp - The OTP code to be confirmed.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
router.route("/confirm").post([isAuthenticated, isVerified, isNotDeleted, isActive], confirm);

/**
 * Disable OTP for a user account.
 *
 * @name DELETE/api/otp/disable
 * @function
 * @memberof module:otpRouter
 * @inner
 * @param {Object} req - Express request object.
 * @param {Object} req.account - The user account object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
router.route("/disable").delete([isAuthenticated, isVerified, isNotDeleted, isActive], disable);

/**
 * Verify OTP code for a user account during login.
 *
 * @name POST/api/otp/verify
 * @function
 * @memberof module:otpRouter
 * @inner
 * @param {Object} req - Express request object.
 * @param {Object} req.body - The request body containing the accountId and OTP code.
 * @param {string} req.body.accountId - The user account ID.
 * @param {string} req.body.otp - The OTP code to be verified.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
router.route("/verify").post(verify);

module.exports = router;
