const { generate_backup_codes } = require("./../../helpers/backup");
const CustomError = require("./../../Errors/CustomError");
const Backup = require("./../Models/Backup.model");

const generateBackupCodes_POST_service = async ({
	userId,
	isBackupEnabled,
}) => {
	if (isBackupEnabled) {
		throw new CustomError(
			"UnAuthorized",
			"Sorry, backup codes feature already enabled!"
		);
	}

	// (1) If already has assinged ones, then don't do it again!
	const backupCodes = await Backup.find({ userId }).select("_id").lean();

	if (backupCodes.length >= 1) {
		throw new CustomError(
			"UnAuthorized",
			"Sorry, you already generated 5 backup codes!"
		);
	}

	// (2) Generate backup codes
	const { codes, hashedCodes } = await generate_backup_codes({
		userId,
		backupCodeNumbers: 5,
	});

	// (3) Save generated backup codes!
	// * The ordered flag when set to false, increases the performance!
	const done = await Backup.insertMany(hashedCodes, { ordered: false });

	if (!done) {
		throw new CustomError(
			"ProcessFailed",
			"Sorry, generate backup codes failed"
		);
	}

	// (4) Return codes to user, and wait for confirm saving them!
	return codes;
};

module.exports = { generateBackupCodes_POST_service };
