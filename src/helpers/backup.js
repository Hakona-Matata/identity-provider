const { generate_randomNumber } = require("./randomNumber");
const { generate_hash, verify_hash } = require("./hash");

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

const verify_find_backup_code = async ({ arrayHashedCode, plainTextCode }) => {
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

module.exports = {
	generate_backup_codes,
	verify_find_backup_code,
};
