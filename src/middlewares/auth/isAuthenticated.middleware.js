const SessionServices = require("../../app/session/session.services");
const TokenHelper = require("../../helpers/token");

const { NotFoundException, UnAuthorizedException } = require("../../exceptions/index");

module.exports = async (req, res, next) => {
	const accessToken = req?.headers["authorization"]?.split(" ")[1];

	if (!accessToken) {
		throw new NotFoundException("Sorry, the access token is not found");
	}

	const { accountId, role, origin } = await TokenHelper.verifyAccessToken(accessToken);

	const isSessionFound = await SessionServices.findOne({ accountId, accessToken });

	if (!isSessionFound) {
		throw new UnAuthorizedException("Sorry, the session may be revoked!");
	}

	req.accountId = accountId;
	req.accountRole = role;

	req.accessToken = accessToken;
	req.tokenOrigin = origin;

	next();
};
