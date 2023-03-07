const { success, failure } = require("../../Errors/responseHandler");
const validate = require("./../../helpers/validate");

const access_validators = require("../Validators/access.validators.js");

const {
	generateBackupCodes_POST_service,
} = require("./../Services/backup.services");

const generateBackupCodes_POST_controller = async (req, res, next) => {
	try {
		const result = await generateBackupCodes_POST_service({
			userId: req.userId,
			isBackupEnabled: req.isBackupEnabled,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

module.exports = { generateBackupCodes_POST_controller };
