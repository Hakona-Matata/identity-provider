const STATUS = require("./../../constants/statusCodes");
const CODE = require("../../constants/errorCodes");

const validate = require("../../helpers/validate");
const { success, failure } = require("../../Exceptions/responseHandler");
const OTP_validators = require("../Validators/OTP.validators");
const {
	enableOTP_GET_service,
	confirmOTP_POST_service,
	DisableOTP_DELETE_service,
	sendOTP_POST_service,
	verifyOTP_POST_service,
} = require("../Services/OTP.services");
const OTPValidators = require("../Validators/OTP.validators");
const OTPServices = require("../otp/otp.services");

const enableOTP_GET_controller = async (req, res, next) => {
	try {
		const result = await enableOTP_GET_service({
			userId: req.userId,
			email: req.email,
			isOTPEnabled: req.isOTPEnabled,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const confirmOTP_POST_controller = async (req, res, next) => {
	try {
		const { otp } = await validate(OTPValidators.confirmOTP, req.body);

		const result = await OTPServices.confirm({
			accountId: req.accountId,
			givenOTP: otp,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const DisableOTP_DELETE_controller = async (req, res, next) => {
	try {
		const result = await DisableOTP_DELETE_service({ userId: req.userId });

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const sendOTP_POST_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(OTP_validators.sendOTP, req.body);

		const result = await sendOTP_POST_service({
			...validatedData,
		});

		return success({ status: STATUS.OK, code: CODE.OK, res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const verifyOTP_POST_controller = async (req, res, next) => {
	try {
		const OTPData = await validate(OTP_validators.verifyOTP, req.body);

		const result = await ({
			accountId: OTPData.accountId,
			givenOTP: OTPData.otp,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

module.exports = {
	enableOTP_GET_controller,
	confirmOTP_POST_controller,
	DisableOTP_DELETE_controller,
	sendOTP_POST_controller,
	verifyOTP_POST_controller,
};
