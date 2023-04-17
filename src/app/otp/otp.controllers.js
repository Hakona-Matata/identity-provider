const { success } = require("./../../Exceptions/responseHandler");
const validate = require("./../../helpers/validate");

const OtpValidators = require("./otp.validators");
const OtpServices = require("./otp.services");

class OtpControllers {
	static async enable(req, res, next) {
		const result = await OtpServices.enable({
			accountId: req.account._id,
			isOtpEnabled: req.account.isOtpEnabled,
		});

		return success({ res, result });
	}

	static async confirm(req, res, next) {
		const { otp } = await validate(OtpValidators.confirm, req.body);

		const result = await OtpServices.confirm({
			accountId: req.accountId,
			givenOtp: otp,
		});

		return success({ res, result });
	}

	static async disable(req, res, next) {
		const result = await OtpServices.disable(req.accountId);

		return success({ res, result });
	}

	static async send(req, res, next) {
		const { accountId } = await validate(OtpValidators.send, req.body);

		const result = await OtpServices.send(accountId);

		return success({ res, result });
	}

	static async verify(req, res, next) {
		const OtpData = await validate(OtpValidators.verify, req.body);

		const result = await OtpServices.verify({
			accountId: OtpData.accountId,
			givenOtp: OtpData.otp,
		});

		return success({ res, result });
	}
}

module.exports = OtpControllers;
