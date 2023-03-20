const {
	generate_backup_codes,
	verify_find_backup_code,
} = require("./../../helpers/backup");
const CustomError = require("./../../Errors/CustomError");

const User = require("./../Models/User.model");
const Backup = require("./../Models/Backup.model");
const { give_access } = require("./../../helpers/token");

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

	// (1) Validate given backup code
	const hashedCodeId = await validate_backup_code({
		plainTextCode: code,
		userId,
	});

	// (2) Delete used code!
	await Backup.findOneAndDelete({ _id: hashedCodeId });

	// (3) Convert the remaning 4 codes to be permanant
	await Backup.updateMany(
		{ userId },
		{
			$set: { isTemp: false },
		}
	);

	// (4) Update user document
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

const regenerateBackupCodes_POST_service = async ({ userId }) => {
	// (1) Delete all old ones (even if they still valid!)
	await Backup.deleteMany({ userId });

	// (2) Update user document, so he needs to verify given new codes before enabling the feature!
	await User.findOneAndUpdate(
		{ _id: userId },
		{
			$set: { isBackupEnabled: false },
			$unset: { BackupEnabledAt: 1 },
		}
	);

	// (3) Generate and save them
	const codes = await generate_save_backup_codes({ userId });

	if (!codes) {
		throw new CustomError(
			"ProcessFailed",
			"Sorry, regenerate backup codes failed"
		);
	}

	// (4) Return codes to user so, he can save them somewhere
	return codes;
};

const disableBackupCodes_delete_service = async ({
	userId,
	isBackupEnabled,
}) => {
	if (!isBackupEnabled) {
		throw new CustomError("UnAuthorized", "Sorry, backup codes isn't enabled!");
	}

	await Backup.deleteMany({ userId });

	const done = await User.findOneAndUpdate(
		{ _id: userId },
		{
			$set: { isBackupEnabled: false },
			$unset: { BackupEnabledAt: 1 },
		}
	);

	if (!done) {
		throw new CustomError(
			"ProcessFailed",
			"Sorry, disable backup codes failed."
		);
	}

	return "Backup codes disabled successfully!";
};

const verifyBackupCodes_POST_service = async ({ email, code }) => {
	// (1) Check if user is really enabled backup codes!
	const user = await User.findOne({ email }).select("isBackupEnabled").lean();

	if (!user) {
		throw new CustomError("InvalidInput", "Sorry, backup code is invalid!");
	}

	if (user && !user.isBackupEnabled) {
		throw new CustomError(
			"UnAuthorized",
			"Sorry, backup codes feature isn't enabled!"
		);
	}

	// (2) Find valid matched backup code (if found)
	const matchedCodeId = await validate_backup_code({
		plainTextCode: code,
		userId: user._id,
	});

	// (3) Now, delete the document
	const done = await Backup.findOneAndDelete({ _id: matchedCodeId });

	if (!done) {
		throw new CustomError("ProcessFailed", "Sorry, verify backup code failed");
	}

	// (4) Give user needed tokens
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

// Some helpers
const validate_backup_code = async ({ plainTextCode, userId }) => {
	// (1) Find all valid user backup codes
	const allUserValidBackupCodes = await Backup.find({
		userId,
	})
		.select("code")
		.lean();

	if (!allUserValidBackupCodes) {
		throw new CustomError("UnAuthorized", "Sorry, no remaining valid codes!");
	}

	// (2) Compare given plain text backup code against our previously found ones!
	const validBackup = await verify_find_backup_code({
		arrayHashedCode: allUserValidBackupCodes,
		plainTextCode,
	});

	if (validBackup.length !== 1) {
		throw new CustomError("InvalidInput", "Sorry, backup code is invalid!");
	}

	// (3) Return that hashedBackup _id for further use
	return validBackup[0]._id;
};

const generate_save_backup_codes = async ({ userId }) => {
	// (1) Generate backup codes
	const { codes, hashedCodes } = await generate_backup_codes({
		userId,
		backupCodeNumbers: 10,
	});

	// (2) Save generated backup codes!
	// * The ordered flag when set to false, increases the performance!
	const done = await Backup.insertMany(hashedCodes, { ordered: false });

	if (!done) {
		throw new CustomError(
			"ProcessFailed",
			"Sorry, generate backup codes failed"
		);
	}

	return codes;
};
