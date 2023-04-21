const validate = require("./../../helpers/validate");

const OtpValidators = require("./otp.validators");
const OtpServices = require("./otp.services");

class OtpControllers {
	static async enable(req, res, next) {
		req.result = await OtpServices.enable({
			accountId: req.account._id,
			isOtpEnabled: req.account.isOtpEnabled,
		});

		next();
	}

	static async confirm(req, res, next) {
		const { otp } = await validate(OtpValidators.confirm, req.body);

		req.result = await OtpServices.confirm({
			accountId: req.accountId,
			givenOtp: otp,
		});

		next();
	}

	static async disable(req, res, next) {
		req.result = await OtpServices.disable({ accountId: req.accountId, isOtpEnabled: req.account.isOtpEnabled });

		next();
	}

	static async verify(req, res, next) {
		const OtpData = await validate(OtpValidators.verify, req.body);

		req.result = await OtpServices.verify({
			accountId: OtpData.accountId,
			givenOtp: OtpData.otp,
		});

		next();
	}
}

module.exports = OtpControllers;
