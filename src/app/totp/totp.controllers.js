const validate = require("./../../helpers/validate");

const TotpValidatores = require("./totp.validators");
const TotpServices = require("./totp.services");

class TotpControllers {
	static async initiateEnabling(req, res, next) {
		req.result = await TotpServices.initiateEnabling({
			accountId: req.account._id,
			isTotpEnabled: req.account.ist,
		});

		next();
	}

	static async confirmEnabling(req, res, next) {
		const { totp } = await validate(TotpValidatores.confirm, req.body);

		req.result = await TotpServices.confirmEnabling({
			accountId: req.account._id,
			givenTotp: totp,
			isTotptEnabled: req.account.isTotpEnabled,
		});

		next();
	}

	static async disable(req, res, next) {
		req.result = await TotpServices.disable({
			accountId: req.account._id,
			isTotpEnabled: req.account.isTotpEnabled,
		});

		next();
	}
}

module.exports = TotpControllers;
