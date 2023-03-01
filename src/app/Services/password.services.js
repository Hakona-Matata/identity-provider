const { generate_hash, verify_hash } = require("./../../helpers/hash");
const { generate_token, verify_token } = require("./../../helpers/token");
const CustomError = require("./../../Errors/CustomError");
const sendEmail = require("./../../helpers/email");

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

const forgetPassword_POST_service = async (userEmail) => {
	const message = `Please, check your mailbox, the link is only valid for ${process.env.FORGET_PASSWORD_EXPIRES_IN}!`;

	const user = await User.findOne({ email: userEmail })
		.select("_id forgetPasswordToken")
		.lean();

	if (!user) {
		return message;
	}

	if (user && user.forgetPasswordToken) {
		const decoded = await verify_token({
			token: user.forgetPasswordToken,
			secret: process.env.FORGET_PASSWORD_SECRET,
		});

		if (decoded) {
			throw new CustomError(
				"InvalidInput",
				"Sorry, your mailbox is already have a valid link!"
			);
		}
	}

	const forgetPasswordToken = await generate_token({
		payload: { _id: user._id },
		secret: process.env.FORGET_PASSWORD_SECRET,
		expiresIn: process.env.FORGET_PASSWORD_EXPIRES_IN,
	});

	const forgetpasswordLink = `${process.env.BASE_URL}:${process.env.PORT}/auth/password/forget/${forgetPasswordToken}`;

	await sendEmail({
		from: "Hakona Matata company",
		to: userEmail,
		subject: "Email Activation",
		text: `Hello, ${user.email}\nPlease click the link to activate your email (It's only valid for ${process.env.FORGET_PASSWORD_EXPIRES_IN})\n${forgetpasswordLink}\nthanks.`,
	});

	const done = await User.findOneAndUpdate(
		{ _id: user._id },
		{ $set: { forgetPasswordToken } }
	).select("_id");

	if (done) {
		throw new CustomError("ProcessFailed", "Sorry, Reset password failed");
	}

	return message;
};

module.exports = { changePassword_PUT_service, forgetPassword_POST_service };
