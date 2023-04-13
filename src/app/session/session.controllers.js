const { success } = require("../../Exceptions/responseHandler");
const STATUS = require("../../constants/statusCodes");
const CODE = require("../../constants/errorCodes");

const validate = require("../../helpers/validate");

const SessionValidators = require("./session.validators");
const SessionServices = require("./session.services");

class SessionControllers {
	static async findAll(req, res, next) {
		const result = await SessionServices.findAll(req.accountId);

		return success({ res, result });
	}

	static async cancel(req, res, next) {
		const { sessionId } = await validate(SessionValidators.cancel, req.body);

		const result = await SessionServices.cancel(req.accountId, sessionId);

		return success({ res, result });
	}

	static async renew(req, res, next) {
		const { refreshToken } = await validate(SessionValidators.renew, req.body);

		const result = await SessionServices.renew(refreshToken);

		return success({ status: STATUS.CREATED, code: CODE.CREATED, res, result });
	}
}

module.exports = SessionControllers;
