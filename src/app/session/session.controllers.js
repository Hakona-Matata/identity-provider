const { success } = require("../../Exceptions/responseHandler");
const STATUS = require("../../constants/statusCodes");
const CODE = require("../../constants/errorCodes");

const validate = require("../../helpers/validate");

const SessionValidators = require("./session.validators");
const SessionServices = require("./session.services");

class SessionControllers {
	static async getAll(req, res, next) {
		const result = await SessionServices.getAll(req.accountId);

		return success({ res, result });
	}

	static async cancel(req, res, next) {
		const accountData = await validate(SessionValidators.cancel, req.body);

		const result = await SessionServices.cancel({
			userId: req.userId,
			sessionId: accountData.sessionId,
		});

		return success({ res, result });
	}

	static async renew(req, res, next) {}
}

module.exports = SessionControllers;
