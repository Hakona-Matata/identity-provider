const STATUS = require("./../../constants/statusCodes");
const CODE = require("../../constants/errorCodes");

const { success, failure } = require("../../Exceptions/responseHandler");
const TOTP_validators = require("../Validators/TOTP.validators");
const validate = require("../../helpers/validate");

const {
	enableTOTP_POST_service,
	confirmTOTP_POST_service,
	disableTOTP_DELETE_service,
	verifyTOTP_POST_service,
} = require("./../Services/TOTP.services");

const enableTOTP_POST_controller = async (req, res, next) => {
	try {
		const result = await enableTOTP_POST_service({
			userId: req.userId,
			isTOTPEnabled: req.isTOTPEnabled,
		});

		return success({ status: STATUS.OK, code: CODE.OK, res, result });
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

		return success({ status: STATUS.OK, code: CODE.OK, res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const disableTOTP_DELETE_controller = async (req, res, next) => {
	try {
		const result = await disableTOTP_DELETE_service({ userId: req.userId });

		return success({ status: STATUS.OK, code: CODE.OK, res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const verifyTOTP_POST_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(TOTP_validators.verifyTOTP, req.body);

		const result = await verifyTOTP_POST_service({
			userId: validatedData.userId,
			givenTOTP: validatedData.totp,
		});

		return success({ status: STATUS.OK, code: CODE.OK, res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

module.exports = {
	enableTOTP_POST_controller,
	confirmTOTP_POST_controller,
	disableTOTP_DELETE_controller,
	verifyTOTP_POST_controller,
};
