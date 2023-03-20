const { generate_randomNumber } = require("./randomNumber");
const { generate_hash, verify_hash } = require("./hash");
const Backup = require("./../app/Models/Backup.model");
const CustomError = require("./../Errors/CustomError");

/*
	* Private function
	This function is to generate n (e.g. 10 codes) of needed backup codes
*/
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

/*
	* Private function
	This function is to verify the given backup code
	It takes:
	- Array of hashed backup codes
	- Plain text backup code to validate aganist!
*/
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

	return result.filter((code) => code.isValid);
};

//----------------------------------------------------------------------------------

/*
	* Public function
	This function is generate and save backup codes
*/
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

/*
	* Public function
	This function is verify and delete found backup code (If found!)
*/
const verify_delete_backup_code = async ({ plainTextCode, userId }) => {
	// (1) Find all valid user backup codes
	const userFoundBackupCodes = await Backup.find({
		userId,
	})
		.select("code")
		.lean();

	if (!userFoundBackupCodes || userFoundBackupCodes.length < 1) {
		throw new CustomError("UnAuthorized", "Sorry, no remaining valid codes!");
	}

	// (2) Compare given plain text backup code against our previously found ones!
	const validBackup = await is_backup_code_valid({
		arrayHashedCode: userFoundBackupCodes,
		plainTextCode,
	});

	// This means no valid backup code in the returned array!
	if (validBackup.length !== 1) {
		throw new CustomError("UnAuthorized", "Sorry, backup code is invalid!");
	}

	// (3) Delete that valid backup code!
	await Backup.findOneAndDelete({ _id: validBackup[0]._id });
};

module.exports = {
	generate_save_backup_codes,
	verify_delete_backup_code,
};
