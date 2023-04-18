const { success } = require("../../Exceptions/responseHandler");

const validate = require("./../../helpers/validate");

const TotpValidatores = require("./totp.validators");
const TotpServices = require("./totp.services");

class TotpControllers {
	static async intiateEnabling(req, res, next) {
		const result = await TotpServices.intiateEnabling({
			accountId: req.account._id,
			isTotpEnabled: req.account.ist,
		});

		return success({ res, result });
	}

	static async confirmEnabling(req, res, next) {
		const { totp } = await validate(TotpValidatores.confirm, req.body);

		const result = await TotpServices.confirmEnabling({
			accountId: req.account._id,
			givenTotp: totp,
			isTotptEnabled: req.account.isTotpEnabled,
		});

		return success({ res, result });
	}

	static async disable(req, res, next) {}

	static async verify(req, res, next) {}
}

module.exports = TotpControllers;
