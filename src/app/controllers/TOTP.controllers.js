const validate = require("../../helpers/validate");
const TOTP_validators = require("../Validators/TOTP.validators");
const { success, failure } = require("../../Errors/responseHandler");
const {
	enableTOTP_POST_service,
	confirmTOTP_POST_service,
} = require("./../Services/TOTP.services");

const enableTOTP_POST_controller = async (req, res, next) => {
	try {
		const result = await enableTOTP_POST_service({
			userId: req.userId,
			isTOTPEnabled: req.isTOTPEnabled,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const confirmTOTP_POST_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(TOTP_validators.confirmTOTP, req.body);

		const result = await confirmTOTP_POST_service({
			userId: req.userId,
			givenTOTP: validatedData.totp,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

module.exports = {
	enableTOTP_POST_controller,
	confirmTOTP_POST_controller,
};
