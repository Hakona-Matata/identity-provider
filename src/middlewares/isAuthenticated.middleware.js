const { FAILIURE_MESSAGES } = require("../constants/messages");
const NotFoundException = require("../Exceptions/common/notFound.exception");
const ForbiddenException = require("./../Exceptions/common/forbidden.exception");

const TokenHelper = require("../helpers/token");
const SessionServices = require("./../app/session/session.services");

module.exports = async (req, res, next) => {
	const accessToken = req?.headers["authorization"]?.split(" ")[1];

	if (!accessToken) {
		throw new NotFoundException(FAILIURE_MESSAGES.ACCESS_TOKEN_NOT_FOUND);
	}

	const { accountId, role, origin, permission } = await TokenHelper.verifyAccessToken(accessToken);

	const isSessionFound = await SessionServices.isSessionFound(accountId, accessToken);

	if (!isSessionFound) {
		throw new ForbiddenException(FAILIURE_MESSAGES.FORBIDDEN_CANCELED_SESSION);
	}

	req.accountId = accountId;
	req.accountRole = role;

	req.accessToken = accessToken;
	req.tokenOrigin = origin;
	req.tokenPermission = permission;

	next();
};
