const { generate_randomNumber } = require("./randomNumber");
const { generate_hash } = require("./hash");

const generate_backup_codes = async ({ userId, backupCodeNumbers }) => {
	const codes = [];
	const hashedCodes = [];

	for (let i = 0; i < backupCodeNumbers; i++) {
		const code = generate_randomNumber({ length: 12 });
		const hashedCode = await generate_hash(`${code}`);

		codes.push(code);
		hashedCodes.push({ userId, code: hashedCode });
	}

	return { codes, hashedCodes };
};

module.exports = { generate_backup_codes };
