const { success } = require("../../Exceptions/responseHandler");

const validate = require("./../../helpers/validate");

const BackupValidators = require("./backup.validators");
const BackupServices = require("./backup.services");

class BackupControllers {
	static async intiateEnabling(req, res, next) {
		const result = await BackupServices.intiateEnabling(req.account);

		return success({ res, result });
	}

	static async confirmEnabling(req, res, next) {
		const { code } = await validate(BackupValidators.confirm, req.body);

		const result = await BackupServices.confirmEnabling({
			account: req.account,
			code,
		});

		return success({ res, result });
	}

	static async disable(req, res, next) {
		const result = await BackupServices.disable(req.account);

		return success({ res, result });
	}

	static async regenerate(req, res, next) {}
}

module.exports = BackupControllers;
