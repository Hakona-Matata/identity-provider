const validate = require("./../../helpers/validate");
const { success, failure } = require("./../../Exceptions/responseHandler");
const SMS_validators = require("./../Validators/SMS.validators");
const {
	enableSMS_POST_service,
	confirmSMS_POST_service,
	disableSMS_delete_service,
	sendSMS_POST_service,
	verifySMS_post_service,
} = require("./../../app/Services/SMS.services");
const smsValidators = require("../sms/sms.validators");

const enableSMS_POST_controller = async (req, res, next) => {
	try {
		const { validatedData } = await validate(SMS_validators.enableSMS, req.body);

		const result = await enableSMS_POST_service({
			userId: req.userId,
			isSMSEnabled: req.isSMSEnabled,
			phoneNumber: validatedData.phone.phoneNumber,
			countryCode: validatedData.phone.countryCode,
			countryName: validatedData.phone.countryName,
			countryIso2: validatedData.phone.countryIso2,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const confirmSMS_POST_controller = async (req, res, next) => {
	try {
		const { otp } = await validate(Smsvali.confirm, req.body);

		const result = await confirmSMS_POST_service({
			userId: req.userId,
			givenOTP: validatedData.otp,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const disableSMS_delete_controller = async (req, res, next) => {
	try {
		const result = await disableSMS_delete_service({
			userId: req.userId,
			isSMSEnabled: req.isSMSEnabled,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const sendSMS_POST_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(SMS_validators.sendSMS, req.body);

		const result = await sendSMS_POST_service({ userId: validatedData.userId });

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const verifySMS_post_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(SMS_validators.verifySMS, req.body);

		const result = await verifySMS_post_service({
			...validatedData,
			givenOTP: validatedData.otp,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

module.exports = {
	enableSMS_POST_controller,
	confirmSMS_POST_controller,
	disableSMS_delete_controller,
	sendSMS_POST_controller,
	verifySMS_post_controller,
};
