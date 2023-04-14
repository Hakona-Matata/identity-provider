const SessionServices = require("./../app/session/session.services");
const TokenHelper = require("../helpers/token");

const NotFoundException = require("../Exceptions/common/notFound.exception");
const ForbiddenException = require("./../Exceptions/common/forbidden.exception");
const {
	FAILIURE_MESSAGES: { ACCESS_TOKEN_NOT_FOUND, SESSION_CANCELED },
} = require("../constants/messages");

module.exports = async (req, res, next) => {
	console.log("auth")
	const accessToken = req?.headers["authorization"]?.split(" ")[1];

	if (!accessToken) {
		throw new NotFoundException(ACCESS_TOKEN_NOT_FOUND);
	}

	const { accountId, role, origin, permission } = await TokenHelper.verifyAccessToken(accessToken);

	const isSessionFound = await SessionServices.findOne(accountId, accessToken);

	if (!isSessionFound) {
		throw new ForbiddenException(SESSION_CANCELED);
	}

	req.accountId = accountId;
	req.accountRole = role;

	req.accessToken = accessToken;
	req.tokenOrigin = origin;
	req.tokenPermission = permission;

	next();
};
