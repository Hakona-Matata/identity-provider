const validate = require("./../../helpers/validate");

const SmsValidators = require("./sms.validators");
const SmsServices = require("./sms.services");

class SmsControllers {
	static async enable(req, res, next) {
		const {
			phone: { phone, country },
		} = await validate(SmsValidators.enable, req.body);

		req.result = await SmsServices.enable({
			accountId: req.accountId,
			isSmsEnabled: req.account.isSmsEnabled,
			phone,
			country,
		});

		next();
	}

	static async confirm(req, res, next) {
		const { otp } = await validate(SmsValidators.confirm, req.body);

		req.result = await SmsServices.confirm({
			accountId: req.accountId,
			givenOtp: otp,
		});

		next();
	}

	static async disable(req, res, next) {
		req.result = await SmsServices.disable({
			accountId: req.accountId,
			isSmsEnabled: req.account.isSmsEnabled,
		});

		next();
	}

	static async verify(req, res, next) {
		const { accountId, otp } = await validate(SmsValidators.verify, req.body);

		req.result = await SmsServices.verify({
			accountId,
			givenOtp: otp,
		});

		next();
	}
}

module.exports = SmsControllers;
