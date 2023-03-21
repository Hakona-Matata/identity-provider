const {
	generate_save_backup_codes,
	verify_delete_backup_code,
} = require("./../../helpers/backup");
const { give_access } = require("./../../helpers/token");
const CustomError = require("./../../Errors/CustomError");

const User = require("./../Models/User.model");
const Backup = require("./../Models/Backup.model");

const generateBackupCodes_POST_service = async ({
	enabledMethodsCount,
	userId,
	isBackupEnabled,
}) => {
	if (isBackupEnabled) {
		throw new CustomError(
			"UnAuthorized",
			"Sorry, backup codes feature already enabled!"
		);
	}
	// (1) Check if at least one 2fa method is enabled!
	if (enabledMethodsCount < 1) {
		throw new CustomError(
			"UnAuthorized",
			"Sorry, you can't generate backup codes without any enabled 2fa methods!"
		);
	}
	// (2) If already has assinged ones, then don't do it again!
	const backupCodes = await Backup.find({ userId }).select("_id").lean();

	if (backupCodes.length >= 1) {
		throw new CustomError(
			"UnAuthorized",
			"Sorry, you already generated backup codes!"
		);
	}

	// (3) Generate and save them
	const codes = await generate_save_backup_codes({ userId });

	// (4) Return codes to user, and wait for confirm saving them!
	return codes;
};

const regenerateBackupCodes_POST_service = async ({ userId }) => {
	await Backup.deleteMany({ userId });

	await User.findOneAndUpdate(
		{ _id: userId },
		{
			$set: { isBackupEnabled: false },
			$unset: { BackupEnabledAt: 1 },
		}
	);

	return await generate_save_backup_codes({ userId });
};

const confirmBackupCodes_POST_service = async ({
	userId,
	code,
	isBackupEnabled,
}) => {
	if (isBackupEnabled) {
		throw new CustomError(
			"UnAuthorized",
			"Sorry, backup codes feature already enabled!"
		);
	}

	// (1) Verify given backup code (delete it if it's true!)
	await verify_delete_backup_code({
		plainTextCode: code,
		userId,
	});

	// (2) Convert the remaning codes to be permanant (For future account recovery)
	await Backup.updateMany(
		{ userId },
		{
			$set: { isTemp: false },
		}
	);

	// (3) Update user document
	const done = await User.findOneAndUpdate(
		{ _id: userId },
		{
			$set: { isBackupEnabled: true, BackupEnabledAt: new Date() },
		}
	);

	if (!done) {
		throw new CustomError(
			"ProcessFailed",
			"Sorry, Enable backup codes feature failed"
		);
	}

	return "Backup codes enabled successfully";
};

const disableBackupCodes_delete_service = async ({
	userId,
	isBackupEnabled,
}) => {
	if (!isBackupEnabled) {
		throw new CustomError("UnAuthorized", "Sorry, backup codes isn't enabled!");
	}

	await Backup.deleteMany({ userId });

	const isBackupDisabled = await User.findOneAndUpdate(
		{ _id: userId },
		{
			$set: { isBackupEnabled: false },
			$unset: { BackupEnabledAt: 1 },
		}
	);

	if (!isBackupDisabled) {
		throw new CustomError(
			"ProcessFailed",
			"Sorry, disable backup codes failed!"
		);
	}

	return "Backup codes disabled successfully!";
};

const verifyBackupCodes_POST_service = async ({ email, code }) => {
	// (1) Check if user is really enabled backup codes!
	const user = await User.findOne({ email }).select("isBackupEnabled").lean();

	if (!user) {
		throw new CustomError("UnAuthorized", "Sorry, backup code is invalid!");
	}

	if (user && !user.isBackupEnabled) {
		throw new CustomError(
			"UnAuthorized",
			"Sorry, backup codes feature isn't enabled!"
		);
	}

	// (2) Verify given backup code (delete it if it's true!)
	await verify_delete_backup_code({
		plainTextCode: code,
		userId: user._id,
	});

	// (3) Give user needed tokens!
	return await give_access({ userId: user._id });

	// TODO: Should redirected to change password route or something like that
};

module.exports = {
	generateBackupCodes_POST_service,
	confirmBackupCodes_POST_service,
	regenerateBackupCodes_POST_service,
	disableBackupCodes_delete_service,
	verifyBackupCodes_POST_service,
};
