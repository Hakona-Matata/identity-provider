const SessionServices = require("../../app/session/session.services");
const TokenHelper = require("../../helpers/tokenHelper");
const { NotFoundException, UnAuthorizedException } = require("../../exceptions/index");

/**
 * Middleware to authenticate and authorize user sessions.
 *
 * @module middleware/authenticateSession
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @throws {NotFoundException} If the access token is not found.
 * @throws {UnAuthorizedException} If the session is revoked or unauthorized.
 */
module.exports = async (req, res, next) => {
	const accessToken = req?.headers["authorization"]?.split(" ")[1];

	if (!accessToken) {
		throw new NotFoundException("Sorry, the access token is not found!");
	}

	const { accountId, origin } = await TokenHelper.verifyAccessToken(accessToken);

	const isSessionFound = await SessionServices.findOne({ accountId, accessToken });

	if (!isSessionFound) {
		throw new UnAuthorizedException("Sorry, the session may be revoked!");
	}

	req.accountId = accountId;
	req.accessToken = accessToken;
	req.tokenOrigin = origin;

	next();
};
