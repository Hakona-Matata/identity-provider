const bcrypt = require("bcrypt");

//=================================================
const generate_hash = async (password) => {
	return await bcrypt.hash(password, 12);
};

const verify_hash = async ({ plainText, hash }) => {
	return await bcrypt.compare(plainText, hash);
};

module.exports = {
	generate_hash,
	verify_hash,
};
