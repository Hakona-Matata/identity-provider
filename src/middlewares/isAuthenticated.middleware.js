const { FAILIURE_MESSAGES } = require("../constants/messages");
const NotFoundException = require("../Exceptions/common/notFound.exception");

const TokenHelper = require("../helpers/token");

module.exports = async (req, res, next) => {
	console.log("isAuth middleware");
	const accessToken = req?.headers["authorization"]?.split(" ")[1];

	if (!accessToken) {
		throw new NotFoundException(FAILIURE_MESSAGES.ACCESS_TOKEN_NOT_FOUND);
	}

	const { accountId, role, origin, permission } = await TokenHelper.verifyAccessToken(accessToken);

	req.accountId = accountId;
	req.accountRole = role;

	req.accessToken = accessToken;
	req.tokenOrigin = origin;
	req.tokenPermission = permission;

	next();
};
