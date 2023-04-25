const validate = require("../../helpers/validateInput");

const OtpValidators = require("./otp.validators");
const OtpServices = require("./otp.services");

class OtpControllers {
	static async enable(req, res, next) {
		req.result = await OtpServices.enable(req.account._id, req.account.isOtpEnabled);

		next();
	}

	static async confirm(req, res, next) {
		const { otp } = await validate(OtpValidators.confirm, req.body);

		req.result = await OtpServices.confirm(req.account._id, otp);

		next();
	}

	static async disable(req, res, next) {
		req.result = await OtpServices.disable(req.accountId, req.account.isOtpEnabled);

		next();
	}

	static async verify(req, res, next) {
		const { accountId, otp } = await validate(OtpValidators.verify, req.body);

		req.result = await OtpServices.verify(accountId, otp);

		next();
	}
}

module.exports = OtpControllers;
