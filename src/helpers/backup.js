const { generate_randomNumber } = require("./randomNumber");
const { generate_hash, verify_hash } = require("./hash");

const Backup = require("./../app/Models/Backup.model");
const CustomError = require("./../Errors/CustomError");

const generate_backup_codes = async ({ userId, backupCodeNumbers }) => {
	const codes = [],
		hashedCodes = [];

	for (let i = 0; i < backupCodeNumbers; i++) {
		const code = generate_randomNumber({ length: 12 });
		const hashedCode = await generate_hash(`${code}`);

		codes.push(code);
		hashedCodes.push({ userId, code: hashedCode });
	}

	return { codes, hashedCodes };
};

const is_backup_code_valid = async ({ arrayHashedCode, plainTextCode }) => {
	const result = [];

	for (let i = 0; i < arrayHashedCode.length; i++) {
		const isValid = await verify_hash({
			plainText: `${plainTextCode}`,
			hash: arrayHashedCode[i].code,
		});

		result.push({
			_id: arrayHashedCode[i]._id,
			code: arrayHashedCode[i].code,
			isValid: isValid ? true : false,
		});
	}

	return result.filter((code) => code.isValid)[0];
};

const generate_save_backup_codes = async ({ userId }) => {
	const { codes, hashedCodes } = await generate_backup_codes({
		userId,
		backupCodeNumbers: 10,
	});

	const isBackupCodesInserted = await Backup.insertMany(hashedCodes);

	if (!isBackupCodesInserted) {
		throw new CustomError(
			"ProcessFailed",
			"Sorry, generate backup codes failed"
		);
	}

	return codes;
};

const verify_delete_backup_code = async ({ plainTextCode, userId }) => {
	const userFoundBackupCodes = await Backup.find({
		userId,
	})
		.select("code")
		.lean();

	if (!userFoundBackupCodes || userFoundBackupCodes.length < 1) {
		throw new CustomError("UnAuthorized", "Sorry, no remaining valid codes!");
	}

	const validBackupCode = await is_backup_code_valid({
		arrayHashedCode: userFoundBackupCodes,
		plainTextCode,
	});

	if (!validBackupCode) {
		throw new CustomError("UnAuthorized", "Sorry, backup code is invalid!");
	}

	return await Backup.findOneAndDelete({ _id: validBackupCode._id });
};

module.exports = {
	generate_save_backup_codes,
	verify_delete_backup_code,
};
