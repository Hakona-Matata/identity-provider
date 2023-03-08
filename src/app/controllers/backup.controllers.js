const { success, failure } = require("../../Errors/responseHandler");
const validate = require("./../../helpers/validate");

const backup_validators = require("../Validators/backup.validators.js");

const {
	generateBackupCodes_POST_service,
	confirmBackupCodes_POST_service,
	regenerateBackupCodes_POST_service,
	disableBackupCodes_delete_service,
	verifyBackupCodes_POST_service,
} = require("./../Services/backup.services");

const generateBackupCodes_POST_controller = async (req, res, next) => {
	try {
		const result = await generateBackupCodes_POST_service({
			enabledMethodsCount: req.enabledMethodsCount,
			userId: req.userId,
			isBackupEnabled: req.isBackupEnabled,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const confirmBackupCodes_POST_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(backup_validators.confirm, req.body);

		const result = await confirmBackupCodes_POST_service({
			isBackupEnabled: req.isBackupEnabled,
			userId: req.userId,
			code: validatedData.code,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const regenerateBackupCodes_POST_controller = async (req, res, next) => {
	try {
		const result = await regenerateBackupCodes_POST_service({
			userId: req.userId,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const disableBackupCodes_delete_controller = async (req, res, next) => {
	try {
		const result = await disableBackupCodes_delete_service({
			userId: req.userId,
			isBackupEnabled: req.isBackupEnabled,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const verifyBackupCodes_POST_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(backup_validators.verify, req.body);

		const result = await verifyBackupCodes_POST_service({ ...validatedData });

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

module.exports = {
	generateBackupCodes_POST_controller,
	confirmBackupCodes_POST_controller,
	regenerateBackupCodes_POST_controller,
	disableBackupCodes_delete_controller,
	verifyBackupCodes_POST_controller,
};
