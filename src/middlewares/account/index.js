const isVerified = require("./isVerified.middleware");
const isActive = require("./isActive.middleware");

/**
 * Middleware module exports.
 *
 * This module exports the `isVerified` and `isActive` middleware functions.
 *
 * @module middleware
 * @type {Object}
 * @property {import('express').RequestHandler} isVerified - Middleware to handle account verification.
 * @property {import('express').RequestHandler} isActive - Middleware to handle account activation.
 */
module.exports = { isVerified, isActive };
