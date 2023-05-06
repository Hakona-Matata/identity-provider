/**
 * This module exports a collection of custom exception classes for common HTTP error codes.
 *
 * @module exceptions
 * @requires ./common/badRequest.exception
 * @requires ./common/forbidden.exception
 * @requires ./common/internalServer.exception
 * @requires ./common/notFound.exception
 * @requires ./common/unAuthorized.exception
 * @requires ./common/validation.exception
 */

const BadRequestException = require("./common/badRequest.exception");
const ForbiddenException = require("./common/forbidden.exception");
const InternalServerException = require("./common/internalServer.exception");
const NotFoundException = require("./common/notFound.exception");
const UnAuthorizedException = require("./common/unAuthorized.exception");
const ValidationException = require("./common/validation.exception");

module.exports = {
	BadRequestException,
	ForbiddenException,
	InternalServerException,
	NotFoundException,
	UnAuthorizedException,
	ValidationException,
};
