const validate = require("./../../helpers/validate");
const { success, failure } = require("./../../Errors/responseHandler");
const OTP_validators = require("./../Validators/OTP.validators");
const { enableOTP_GET_service } = require("./../Services/OTP.services");

const enableOTP_GET_controller = async (req, res, next) => {
	try {
		const result = await enableOTP_GET_service(req.userId);

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

module.exports = { enableOTP_GET_controller };
