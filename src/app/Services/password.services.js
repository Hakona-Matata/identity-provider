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
	const message = `Please, check your mailbox, the link is only valid for ${process.env.RESET_PASSWORD_EXPIRES_IN}!`;

	const user = await User.findOne({ email: userEmail })
		.select("_id resetToken")
		.lean();

	if (!user) {
		return message;
	}

	if (user && user.resetToken) {
		const decoded = await verify_token({
			token: user.resetToken,
			secret: process.env.RESET_PASSWORD_SECRET,
		});

		if (decoded) {
			throw new CustomError(
				"UnAuthorized",
				"Sorry, your mailbox already have a valid link!"
			);
		}
	}

	const resetToken = await generate_token({
		payload: { _id: user._id },
		secret: process.env.RESET_PASSWORD_SECRET,
		expiresIn: process.env.RESET_PASSWORD_EXPIRES_IN,
	});

	const resetLink = `${process.env.BASE_URL}:${process.env.PORT}/auth/password/reset/${resetToken}`;

	if (process.env.NODE_ENV !== "test") {
		await sendEmail({
			from: "Hakona Matata company",
			to: userEmail,
			subject: "Forget Password",
			text: `Hello, ${user.email}\nPlease click the link to activate your email (It's only valid for ${process.env.RESET_PASSWORD_EXPIRES_IN})\n${resetLink}\nthanks.`,
		});
	}

	const done = await User.findOneAndUpdate(
		{ _id: user._id },
		{ $set: { resetToken } }
	).select("_id");

	if (!done) {
		throw new CustomError("ProcessFailed", "Sorry, Forget password failed");
	}

	return message;
};

const resetToken_PUT_service = async (data) => {
	// (1) Verify given token
	const decoded = await verify_token({
		token: data.resetToken,
		secret: process.env.RESET_PASSWORD_SECRET,
	});

	// (2) Get user, and check if he already asked for password reset!
	const user = await User.findOne({ _id: decoded._id })
		.select("resetToken")
		.lean();

	if (!user || !user.resetToken) {
		throw new CustomError(
			"UnAuthorized",
			"Sorry, you already reset your password!"
		);
	}

	// (3) Create new password
	const password = await generate_hash(data.password);

	// (4) Delete all sessions found created by that forgetton password
	await Session.deleteMany({ userId: user._id });

	// (5) Update user document
	const done = await User.findOneAndUpdate(
		{ _id: decoded._id },
		{
			$set: { password, resetAt: new Date() },
			$unset: { resetToken: 1 },
		}
	).select("_id");

	if (!done) {
		throw new CustomError("ProcessFailed", "Sorry, Reset password failed");
	}

	return "Password reset was successful";
};

module.exports = {
	changePassword_PUT_service,
	forgetPassword_POST_service,
	resetToken_PUT_service,
};
