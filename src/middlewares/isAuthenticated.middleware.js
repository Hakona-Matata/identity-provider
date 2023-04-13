const SessionServices = require("./../app/session/session.services");
const TokenHelper = require("../helpers/token");

const NotFoundException = require("../Exceptions/common/notFound.exception");
const ForbiddenException = require("./../Exceptions/common/forbidden.exception");
const {
	FAILIURE_MESSAGES: { ACCESS_TOKEN_NOT_FOUND, FORBIDDEN_CANCELED_SESSION },
} = require("../constants/messages");

module.exports = async (req, res, next) => {
	const accessToken = req?.headers["authorization"]?.split(" ")[1];

	if (!accessToken) {
		throw new NotFoundException(ACCESS_TOKEN_NOT_FOUND);
	}

	const { accountId, role, origin, permission } = await TokenHelper.verifyAccessToken(accessToken);

	const isSessionFound = await SessionServices.findOne(accountId, accessToken);

	if (!isSessionFound) {
		throw new ForbiddenException(FORBIDDEN_CANCELED_SESSION);
	}

	req.accountId = accountId;
	req.accountRole = role;

	req.accessToken = accessToken;
	req.tokenOrigin = origin;
	req.tokenPermission = permission;

	next();
};
