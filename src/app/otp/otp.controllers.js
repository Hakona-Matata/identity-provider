const { success } = require("./../../Exceptions/responseHandler");
const validate = require("./../../helpers/validate");

const OTPValidators = require("./otp.validators");
const OTPServices = require("./otp.services");

class OTPControllers {
	static async enable(req, res, next) {
		const result = await OTPServices.enable({
			accountId: req.account._id,
			isOTPEnabled: req.account.isOTPEnabled,
		});

		return success({ res, result });
	}

	static async confirm(req, res, next) {
		const { otp } = await validate(OTPValidators.confirm, req.body);

		const result = await OTPServices.confirm({
			accountId: req.accountId,
			givenOTP: otp,
		});

		return success({ res, result });
	}

	static async disable(req, res, next) {
		const result = await OTPServices.disable(req.accountId);

		return success({ res, result });
	}

	static async send(req, res, next) {
		const { accountId } = await validate(OTPValidators.send, req.body);

		const result = await OTPServices.send(accountId);

		return success({ res, result });
	}

	static async verify(req, res, next) {
		const OTPData = await validate(OTPValidators.verify, req.body);

		const result = await OTPServices.verify({
			accountId: OTPData.accountId,
			givenOTP: OTPData.otp,
		});

		return success({ res, result });
	}
}

module.exports = OTPControllers;
