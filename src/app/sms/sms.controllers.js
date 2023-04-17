const { success } = require("../../Exceptions/responseHandler");

const validate = require("./../../helpers/validate");

const SmsValidators = require("./sms.validators");
const SmsServices = require("./sms.services");

class SmsControllers {
	static async enable(req, res, next) {
		const {
			phone: { phone, country },
		} = await validate(SmsValidators.enable, req.body);

		const result = await SmsServices.enable({
			accountId: req.accountId,
			isSmsEnabled: req.account.isSmsEnabled,
			phone,
			country,
		});

		return success({ res, result });
	}

	static async confirm(req, res, next) {
		const { otp } = await validate(SmsValidators.confirm, req.body);

		const result = await SmsServices.confirm({
			accountId: req.accountId,
			givenOtp: otp,
		});

		return success({ res, result });
	}

	static async disable(req, res, next) {
		const result = await SmsServices.disable({
			accountId: req.accountId,
			isSmsEnabled: req.account.isSmsEnabled,
		});

		return success({ res, result });
	}
}

module.exports = SmsControllers;
