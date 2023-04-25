const validate = require("../../helpers/validateInput");

const SessionValidators = require("./session.validators");
const SessionServices = require("./session.services");

class SessionControllers {
	static async findAll(req, res, next) {
		req.result = await SessionServices.findMany({ accountId: req.accountId });

		next();
	}

	static async cancel(req, res, next) {
		const { sessionId } = await validate(SessionValidators.cancel, req.body);

		req.result = await SessionServices.cancel({ accountId: req.accountId, sessionId });

		next();
	}

	static async renew(req, res, next) {
		const { refreshToken } = await validate(SessionValidators.renew, req.body);

		req.result = await SessionServices.renew(refreshToken);

		next();
	}

	static async validate(req, res, next) {
		const { accessToken } = await validate(SessionValidators.validate, req.body);

		req.result = await SessionServices.validate(accessToken);

		next();
	}
}

module.exports = SessionControllers;
