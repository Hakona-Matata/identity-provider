const CustomError = require("./../../Exceptions/CustomError");
const STATUS = require("../../constants/statusCodes");
const CODE = require("../../constants/errorCodes");

const { generate_hash, verify_hash } = require("./../../helpers/hash");
const { generate_token, verify_token } = require("./../../helpers/token");
const sendEmail = require("./../../helpers/email");

const User = require("./../Models/User.model");
const Session = require("./../Models/Session.model");

const changePassword_PUT_service = async (data) => {
	const isPasswordValid = await verify_hash({
		plainText: data.oldPassword,
		hash: data.currentUserPassword,
	});

	if (!isPasswordValid) {
		throw new CustomError({
			status: STATUS.UNAUTHORIZED,
			code: CODE.UNAUTHORIZED,
			message: "Sorry, the given password is incorrect!",
		});
	}

	const newPassword = await generate_hash(data.newPassword);

	const isPasswordUpdated = await User.findOneAndUpdate(
		{ _id: data.userId },
		{ $set: { password: newPassword, passwordChangedAt: new Date() } }
	);

	if (!isPasswordUpdated) {
		throw CustomError({
			status: STATUS.INTERNAL_SERVER_ERROR,
			code: CODE.INTERNAL_SERVER_ERROR,
			message: "Password update failed.",
		});
	}

	const areOldSessionsDeleted = await Session.deleteMany({
		userId: data.userId,
	});

	if (!areOldSessionsDeleted) {
		throw CustomError({
			status: STATUS.INTERNAL_SERVER_ERROR,
			code: CODE.INTERNAL_SERVER_ERROR,
			message: "Old sessions deletion failed",
		});
	}

	return "Password changed successfully!";
};

const forgetPassword_POST_service = async (userEmail) => {
	const user = await User.findOne({ email: userEmail })
		.select("_id resetToken")
		.lean();

	if (!user) {
		return `Please, check your mailbox!`;
	}

	if (user && user.resetToken) {
		const decodedResetToken = await verify_token({
			token: user.resetToken,
			secret: process.env.RESET_PASSWORD_SECRET,
		});

		if (decodedResetToken) {
			throw new CustomError({
				status: STATUS.FORBIDDEN,
				code: CODE.FORBIDDEN,
				message: "Sorry, your mailbox already has a valid reset link!",
			});
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

	const isForgetPasswordSucceeded = await User.findOneAndUpdate(
		{ _id: user._id },
		{ $set: { resetToken } }
	).select("_id");

	if (!isForgetPasswordSucceeded) {
		throw new CustomError({
			status: STATUS.INTERNAL_SERVER_ERROR,
			code: CODE.INTERNAL_SERVER_ERROR,
			message: "Sorry, Forget password failed",
		});
	}

	return `Please, check your mailbox!`;
};

const resetToken_PUT_service = async (data) => {
	const decodedResetToken = await verify_token({
		token: data.resetToken,
		secret: process.env.RESET_PASSWORD_SECRET,
	});

	const user = await User.findOne({ _id: decodedResetToken._id })
		.select("resetToken")
		.lean();

	if (user && !user.resetToken) {
		throw new CustomError({
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, you already reset your password!",
		});
	}

	const newPassword = await generate_hash(data.password);

	const areOldSessionsDeleted = await Session.deleteMany({ userId: user._id });

	if (!areOldSessionsDeleted) {
		throw new CustomError({
			status: STATUS.INTERNAL_SERVER_ERROR,
			code: CODE.INTERNAL_SERVER_ERROR,
			message: "Old sessions deletion failed.",
		});
	}

	const isPasswordResetSuccessfully = await User.findOneAndUpdate(
		{ _id: decodedResetToken._id },
		{
			$set: { password: newPassword, resetAt: new Date() },
			$unset: { resetToken: 1 },
		}
	).select("_id");

	if (!isPasswordResetSuccessfully) {
		throw new CustomError({
			status: STATUS.INTERNAL_SERVER_ERROR,
			code: CODE.INTERNAL_SERVER_ERROR,
			message: "Sorry, Reset password failed",
		});
	}

	return "Password reset successfully!";
};

module.exports = {
	changePassword_PUT_service,
	forgetPassword_POST_service,
	resetToken_PUT_service,
};
