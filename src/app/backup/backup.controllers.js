const validate = require("./../../helpers/validate");

const BackupValidators = require("./backup.validators");
const BackupServices = require("./backup.services");

class BackupControllers {
	static async initiateEnabling(req, res, next) {
		req.result = await BackupServices.initiateEnabling(req.account);

		next();
	}

	static async confirmEnabling(req, res, next) {
		const { code } = await validate(BackupValidators.confirm, req.body);

		req.result = await BackupServices.confirmEnabling({
			account: req.account,
			code,
		});

		next();
	}

	static async disable(req, res, next) {
		req.result = await BackupServices.disable(req.account);

		next();
	}

	static async regenerate(req, res, next) {
		req.result = await BackupServices.regenerate(req.account._id);

		next();
	}

	static async verify(req, res, next) {
		const { email, code } = await validate(BackupValidators.verify, req.body);

		req.result = await BackupServices.verify({ email, code });

		next();
	}
}

module.exports = BackupControllers;
