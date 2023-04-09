const { FAILIURE_MESSAGES } = require("./../constants/messages");
const NotFoundException = require("../Exceptions/common/notFound.exception");

const TokenHelper = require("./../helpers/token");

module.exports = async (req, res, next) => {
	const accessToken = req?.headers["authorization"]?.split(" ")[1];

	if (!accessToken) {
		throw new NotFoundException(FAILIURE_MESSAGES.ACCESS_TOKEN_NOT_FOUND);
	}

	const { _id: userId, role, origin, permission } = await TokenHelper.verifyAccessToken(accessToken);

	req.userId = userId;
	req.accessToken = accessToken;
	req.userRole = role;
	req.tokenOrigin = origin;
	req.permission = permission;

	next();
};
