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
