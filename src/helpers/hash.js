const bcrypt = require("bcrypt");

//=================================================
const create_hash = async (password) => {
	return await bcrypt.hash(password, 12);
};

const verify_hash = async ({ plainText, hash }) => {
	return await bcrypt.compare(plainText, hash);
};

module.exports = {
	create_hash,
	verify_hash,
};
