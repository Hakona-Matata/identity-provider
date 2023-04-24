const validate = require("./../../helpers/validate");

const TotpValidatores = require("./totp.validators");
const TotpServices = require("./totp.services");

class TotpControllers {
	static async initiateEnabling(req, res, next) {
		req.result = await TotpServices.initiateEnabling(req.account._id, req.account.ist);

		next();
	}

	static async confirmEnabling(req, res, next) {
		const { totp } = await validate(TotpValidatores.confirm, req.body);

		req.result = await TotpServices.confirmEnabling(req.account._id, totp, req.account.isTotpEnabled);

		next();
	}

	static async disable(req, res, next) {
		req.result = await TotpServices.disable(req.account._id, req.account.isTotpEnabled);

		next();
	}

	static async verify(req, res, next) {
		const { accountId, totp } = await validate(TotpValidatores.verify, req.body);

		req.result = await TotpServices.verify(accountId, totp);

		next();
	}
}

module.exports = TotpControllers;
