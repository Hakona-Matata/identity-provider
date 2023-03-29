const CustomError = require("./../../Errors/CustomError");
const STATUS = require("../../constants/statusCodes");
const CODE = require("../../constants/errorCodes");

const { generate_token, verify_token } = require("./../../helpers/token");
const sendEmail = require("./../../helpers/email");

const User = require("./../Models/User.model");

const deactivateAccount_PUT_service = async ({ userId }) => {
	const isUserDeactivated = await User.findOneAndUpdate(
		{ _id: userId },
		{ $set: { isActive: false, activeStatusChangedAt: new Date() } }
	).select("isActive");

	if (!isUserDeactivated) {
		throw new CustomError({
			status: STATUS.INTERNAL_SERVER_ERROR,
			code: CODE.INTERNAL_SERVER_ERROR,
			message: "Sorry, Account Deactivation failed",
		});
	}

	return "Account deactivated successfully!";
};

const activateAccount_PUT_service = async ({ email }) => {
	const user = await User.findOne({ email })
		.select("email isActive isVerified isDeleted activationToken")
		.lean();

	if (!user) {
		return `Please, check your mailbox to confirm your account activation\nYou only have ${process.env.ACTIVATION_TOKEN_EXPIRES_IN}`;
	}

	if (!user.isVerified) {
		throw new CustomError({
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, your email address isn't verified yet!",
		});
	}

	if (user.isDeleted) {
		throw new CustomError({
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, your account is temporarily deleted!",
		});
	}

	if (user.isActive) {
		throw new CustomError({
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, your account is already active!",
		});
	}

	if (user.activationToken) {
		const decodedActivationToken = await verify_token({
			token: user.activationToken,
			secret: process.env.ACTIVATION_TOKEN_SECRET,
		});

		if (decodedActivationToken) {
			throw new CustomError({
				status: STATUS.FORBIDDEN,
				code: CODE.FORBIDDEN,
				message: "Sorry, you still have a valid link in your mailbox!",
			});
		}
	}

	const newActivationToken = await generate_token({
		payload: { _id: user._id },
		secret: process.env.ACTIVATION_TOKEN_SECRET,
		expiresIn: process.env.ACTIVATION_TOKEN_EXPIRES_IN,
	});

	const newActivationLink = `${process.env.BASE_URL}:${process.env.PORT}/auth/account/activate/${newActivationToken}`;

	if (process.env.NODE_ENV !== "test") {
		await sendEmail({
			from: "Hakona Matata company",
			to: user.email,
			subject: "Email Activation",
			text: `Hello, ${user.email}\nPlease click the link to activate your email (It's only valid for ${process.env.ACTIVATION_TOKEN_EXPIRES_IN})\n${newActivationLink}\nthanks.`,
		});
	}

	const isUserUpdated = await User.findOneAndUpdate(
		{ email },
		{ $set: { activationToken: newActivationToken } }
	).select("_id");

	if (!isUserUpdated) {
		throw new CustomError({
			status: STATUS.INTERNAL_SERVER_ERROR,
			code: CODE.INTERNAL_SERVER_ERROR,
			message: "Sorry, Email Activation failed",
		});
	}

	return `Please, check your mailbox to confirm your account activation\nYou only have ${process.env.ACTIVATION_TOKEN_EXPIRES_IN}`;
};

const confirmActivation_GET_service = async ({ activationToken }) => {
	const decodedActivationToken = await verify_token({
		token: activationToken,
		secret: process.env.ACTIVATION_TOKEN_SECRET,
	});

	const user = await User.findOne({
		_id: decodedActivationToken._id,
	})
		.select("isActive isVerified isDeleted activationToken")
		.lean();

	if (!user.isVerified) {
		throw new CustomError({
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, your email address isn't verified yet!",
		});
	}

	if (user.isDeleted) {
		throw new CustomError({
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, your account is temporarily deleted!",
		});
	}

	if (user.isActive) {
		throw new CustomError({
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, your account is already active!",
		});
	}

	const isUserActivated = await User.findOneAndUpdate(
		{ _id: decodedActivationToken._id },
		{
			$set: { isActive: true, activeStatusChangedAt: new Date() },
			$unset: { activationToken: 1 },
		}
	);

	if (!isUserActivated) {
		throw new CustomError({
			status: STATUS.INTERNAL_SERVER_ERROR,
			code: CODE.INTERNAL_SERVER_ERROR,
			message: "Sorry, 'Email Activation' confirm failed",
		});
	}

	return "Account is activated successfully";
};

const deleteAccount_DELETE_service = async ({ userId }) => {
	const isUserDeleted = await User.findOneAndUpdate(
		{ _id: userId },
		{
			$set: { isDeleted: true, isDeletedAt: new Date() },
		}
	).select("_id");

	if (!isUserDeleted) {
		throw new CustomError({
			status: STATUS.INTERNAL_SERVER_ERROR,
			code: CODE.INTERNAL_SERVER_ERROR,
			message: "Sorry, Account deletion failed",
		});
	}

	return `Your account Will be deleted permenantly in 30 days, unless you cancelled the deletion later!`;
};

const cancelDeleteAccount_PUT_service = async ({ email }) => {
	const foundUser = await User.findOne({ email }).select("isDeleted").lean();

	if (foundUser && !foundUser.isDeleted) {
		throw new CustomError({
			status: STATUS.BAD_REQUEST,
			code: CODE.BAD_REQUEST,
			message: "Sorry, you already canceled account deletion!",
		});
	}

	const isUserUpdated = await User.findOneAndUpdate(
		{ email },
		{ $set: { isDeleted: false }, $unset: { isDeletedAt: 1 } }
	);

	if (!isUserUpdated) {
		throw new CustomError({
			status: STATUS.BAD_REQUEST,
			code: CODE.BAD_REQUEST,
			message: "Sorry, your account may be deleted permanently! (too late)",
		});
	}

	return "You canceled the account deletion successfully!";
};

module.exports = {
	deactivateAccount_PUT_service,
	activateAccount_PUT_service,
	confirmActivation_GET_service,
	deleteAccount_DELETE_service,
	cancelDeleteAccount_PUT_service,
};
