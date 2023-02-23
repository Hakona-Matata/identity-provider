const User = require("./../Models/User.model");

//======================================================

const signUp_POST_service = async (data) => {
	const user = new User(data);

	return await user.save();

	// TODO: create and send email verification email!
};

module.exports = {
	signUp_POST_service,
};
