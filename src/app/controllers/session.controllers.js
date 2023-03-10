const { success, failure } = require("../../Errors/responseHandler");
const validate = require("./../../helpers/validate");
const session_validators = require("./../Validators/session.validators");
const {
	all_sessions_GET_service,
	cancel_session_POST_service,
	renew_session_POST_service,
} = require("./../Services/session.services");

const all_sessions_GET_controller = async (req, res, next) => {
	try {
		const result = await all_sessions_GET_service(req.userId);

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const cancel_session_POST_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(session_validators.cancel, req.body);

		const result = await cancel_session_POST_service({
			userId: req.userId,
			sessionId: validatedData.sessionId,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const renew_session_POST_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(session_validators.renew, req.body);

		const result = await renew_session_POST_service({
			userId: req.userId,
			givenRefreshToken: validatedData.refreshToken,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

module.exports = {
	all_sessions_GET_controller,
	cancel_session_POST_controller,
	renew_session_POST_controller,
};
