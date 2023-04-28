const express = require("express");

const { initiateEnabling, confirmEnabling, disable, regenerate, verify } = require("./backup.controllers");
const { isAuthenticated, isVerified, isActive ,isNotDeleted } = require("./../../middlewares/index");

/**
 * Express router for backup-related routes.
 * @type {import('express').Router}
 */
const router = express.Router();

/**
 * Route for initiating backup enabling.
 * @name POST /backup/initiate
 * @function
 * @memberof module:backupRoutes
 * @inner
 * @param {string} path - Express route path.
 * @param {function[]} middleware - Array of middleware functions to execute.
 * @param {function} handler - Express request handler function.
 */
router.route("/initiate").post([isAuthenticated, isVerified, isNotDeleted, isActive], initiateEnabling);

/**
 * Route for confirming backup enabling.
 * @name POST /backup/confirm
 * @function
 * @memberof module:backupRoutes
 * @inner
 * @param {string} path - Express route path.
 * @param {function[]} middleware - Array of middleware functions to execute.
 * @param {function} handler - Express request handler function.
 */
router.route("/confirm").post([isAuthenticated, isVerified, isNotDeleted, isActive], confirmEnabling);

/**
 * Route for disabling backup.
 * @name DELETE /backup/disable
 * @function
 * @memberof module:backupRoutes
 * @inner
 * @param {string} path - Express route path.
 * @param {function[]} middleware - Array of middleware functions to execute.
 * @param {function} handler - Express request handler function.
 */
router.route("/disable").delete([isAuthenticated, isVerified, isNotDeleted, isActive],disable);

/**
 * Route for regenerating backup.
 * @name POST /backup/regenerate
 * @function
 * @memberof module:backupRoutes
 * @inner
 * @param {string} path - Express route path.
 * @param {function[]} middleware - Array of middleware functions to execute.
 * @param {function} handler - Express request handler function.
 */
router.route("/regenerate").post([isAuthenticated, isVerified, isNotDeleted, isActive],regenerate);

/**
 * Route for verifying backup.
 * @name POST /backup/verify
 * @function
 * @memberof module:backupRoutes
 * @inner
 * @param {string} path - Express route path.
 * @param {function} handler - Express request handler function.
 */
router.route("/verify", verify);

/**
 * Module representing backup-related routes.
 * @module backupRoutes
 */
module.exports = router;
