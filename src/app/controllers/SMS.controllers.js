const validate = require("./../../helpers/validate");
const { success, failure } = require("./../../Errors/responseHandler");
const SMS_validators = require("./../Validators/SMS.validators");
const { enableSMS_POST_service } = require("./../../app/Services/SMS.services");

const enableSMS_POST_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(SMS_validators.enableSMS, req.body);

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

module.exports = { enableSMS_POST_controller };
