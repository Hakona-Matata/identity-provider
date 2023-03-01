const { generate_hash, verify_hash } = require("./../../helpers/hash");
const CustomError = require("./../../Errors/CustomError");

const User = require("./../Models/User.model");
const Session = require("./../Models/Session.model");

const changePassword_PUT_service = async (data) => {
	// (1) Compare hashes!
	const isPasswordValid = await verify_hash({
		plainText: data.oldPassword,
		hash: data.userPassword,
	});

	if (!isPasswordValid) {
		throw new CustomError("UnAuthorized", "Sorry, the password is invalid!");
	}

	// (2) create new hash
	const newPassword = await generate_hash(data.newPassword);

	// (3) Save new password
	await User.findOneAndUpdate(
		{ _id: data.userId },
		{ $set: { password: newPassword, passwordChangedAt: new Date() } }
	);

	// (4) Delete all sessions
	await Session.deleteMany({ userId: data.userId });

	return "Password changed successfully";
};

module.exports = { changePassword_PUT_service };
