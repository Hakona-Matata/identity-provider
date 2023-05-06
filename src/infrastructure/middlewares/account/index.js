/**
 * Middleware module exports.
 *
 * This module exports the `isVerified` and `isActive` middleware functions.
 *
 * @module middleware
 * @type {Object}
 * @property {import('express').RequestHandler} isVerified - Middleware to handle account verification.
 * @property {import('express').RequestHandler} isActive - Middleware to handle account activation.
 * @property {import('express').RequestHandler} isNotDeleted - Middleware to check if the account is not deleted.
 */
const isVerified = require("./isVerified.middleware");
const isActive = require("./isActive.middleware");
const isNotDeleted = require("./isNotDeleted.middleware");

module.exports = { isVerified, isActive, isNotDeleted };
