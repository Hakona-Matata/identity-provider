const validate = require("../../helpers/validate");
const { success, failure } = require("../../Errors/responseHandler");
const OTP_validators = require("../Validators/OTP.validators");
const {
	enableOTP_GET_service,
	confirmOTP_POST_service,
	DisableOTP_DELETE_service,
	sendOTP_POST_service,
	verifyOTP_POST_service,
} = require("../Services/OTP.services");

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
		const validatedData = await validate(OTP_validators.confirmOTP, req.body);

		const result = await confirmOTP_POST_service({
			userId: req.userId,
			givenOTP: validatedData.otp,
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
			userId: validatedData.userId,
			email: validatedData.email,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const verifyOTP_POST_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(OTP_validators.verifyOTP, req.body);

		const result = await verifyOTP_POST_service({
			userId: validatedData.userId,
			givenOTP: validatedData.otp,
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
