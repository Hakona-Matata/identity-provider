const User = require("./../Models/User.model");
const CustomError = require("./../../Errors/CustomError");

const deactivateAccount_PUT_service = async ({ isActive, userId }) => {
	const done = await User.findOneAndUpdate(
		{ _id: userId },
		{ $set: { isActive: false, activeStatusChangedAt: new Date() } }
	).select("isActive");

	if (!done) {
		throw new Error("Sorry, Account Deactivation failed");
	}

	return "Account deactivated successfully!";
};

module.exports = {
	deactivateAccount_PUT_service,
};
