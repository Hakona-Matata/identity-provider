/**
 * Express router for Sms related routes.
 * @module SmsRouter
 */

const express = require("express");

const { enable, confirm, disable, verify } = require("./sms.controllers");
const { isAuthenticated, isVerified, isActive,isNotDeleted } = require("./../../middlewares/index");

const router = express.Router();

/**
 * Route for enabling OTP over SMS feature.
 * @name post/enable
 * @function
 * @memberof module:SmsRouter
 * @inner
 * @param {middleware} isAuthenticated - Middleware function to check if the user is authenticated.
 * @param {middleware} isVerified - Middleware function to check if the user's email is verified.
 * @param {middleware} isActive - Middleware function to check if the user's account is active.
 * @param {function} enable - Controller function to enable the OTP over SMS feature.
 */
router.route("/enable").post([isAuthenticated, isVerified, isNotDeleted, isActive], enable);

/**
 * Route for confirming the OTP over SMS feature.
 * @name post/confirm
 * @function
 * @memberof module:SmsRouter
 * @inner
 * @param {middleware} isAuthenticated - Middleware function to check if the user is authenticated.
 * @param {middleware} isVerified - Middleware function to check if the user's email is verified.
 * @param {middleware} isActive - Middleware function to check if the user's account is active.
 * @param {function} confirm - Controller function to confirm the OTP over SMS feature.
 */
router.route("/confirm").post([isAuthenticated, isVerified, isNotDeleted, isActive], confirm);

/**
 * Route for disabling the OTP over SMS feature.
 * @name delete/disable
 * @function
 * @memberof module:SmsRouter
 * @inner
 * @param {middleware} isAuthenticated - Middleware function to check if the user is authenticated.
 * @param {middleware} isVerified - Middleware function to check if the user's email is verified.
 * @param {middleware} isActive - Middleware function to check if the user's account is active.
 * @param {function} disable - Controller function to disable the OTP over SMS feature.
 */
router.route("/disable").delete([isAuthenticated, isVerified, isNotDeleted, isActive], disable);

/**
 * Route for verifying the OTP sent over SMS.
 * @name post/verify
 * @function
 * @memberof module:SmsRouter
 * @inner
 * @param {function} verify - Controller function to verify the OTP over SMS.
 */
router.route("/verify").post(verify);

module.exports = router;
