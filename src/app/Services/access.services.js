const CustomError = require("../../Exceptions/CustomError");
const STATUS = require("../../constants/statusCodes");
const CODE = require("../../constants/errorCodes");
// const MESSAGE = require("../../constants/successMessages");

const { generate_token, verify_token } = require("./../../helpers/token");
const give_access = require("./../../helpers/giveAccess");
const { generate_hash, verify_hash } = require("./../../helpers/hash");
const sendEmail = require("./../../helpers/email");

const User = require("./../Models/User.model");
const Session = require("../Models/Session.model");

const signUp_POST_service = async (data) => {
	const user = await User.create({
		...data,
		password: await generate_hash(data.password),
	});

	const verificationToken = await generate_token({
		payload: { _id: user._id },
		secret: process.env.VERIFICATION_TOKEN_SECRET,
		expiresIn: process.env.VERIFICATION_TOKEN_EXPIRES_IN,
	});

	const verificationLink = `${process.env.BASE_URL}:${process.env.PORT}/auth/verify-email/${verificationToken}`;

	if (process.env.NODE_ENV !== "test") {
		await sendEmail({
			from: "Hakona Matata company",
			to: user.email,
			subject: "Email Verification",
			text: `Hello, ${user.email}\nPlease click the link to verify your email (It's only valid for ${process.env.VERIFICATION_TOKEN_EXPIRES_IN})\n${verificationLink}\nthanks.`,
		});
	}

	const isUserCreated = await User.findOneAndUpdate(
		{ _id: user.id },
		{ $set: { verificationToken } }
	);

	if (!isUserCreated) {
		throw new CustomError({
			status: STATUS.INTERNAL_SERVER_ERROR,
			code: CODE.INTERNAL_SERVER_ERROR,
			message: "Sorry, Sign up process failed!",
		});
	}

	// return MESSAGE.CHECK_MAILBOX_AFTER_SIGN_UP;
};

const verify_GET_service = async (data) => {
	const decodedVerificationToken = await verify_token({
		token: data.verificationToken,
		secret: process.env.VERIFICATION_TOKEN_SECRET,
	});

	const user = await User.findOne({
		_id: decodedVerificationToken._id,
	})
		.select("verificationToken isVerified")
		.lean();

	if (!user.verificationToken || user.isVerified) {
		throw new CustomError({
			status: STATUS.BAD_REQUEST,
			code: CODE.BAD_REQUEST,
			message: "Sorry, your account is already verified!",
		});
	}

	await User.findOneAndUpdate(
		{ _id: decodedVerificationToken._id },
		{
			$set: { isVerified: true, isVerifiedAt: new Date() },
			$unset: { verificationToken: 1 },
		}
	);

	return "Your account is verified successfully!";
};

const login_POST_service = async ({ email, password }) => {
	const user = await User.findOne({ email })
		.select(
			"email password isVerified isActive isTempDeleted isOTPEnabled isSMSEnabled isTOTPEnabled"
		)
		.lean();

	if (!user) {
		throw new CustomError({
			status: STATUS.UNAUTHORIZED,
			code: CODE.UNAUTHORIZED,
			message: "Sorry, email or password are incorrect!",
		});
	}

	if (!user.isVerified) {
		throw new CustomError({
			status: STATUS.UNAUTHORIZED,
			code: CODE.UNAUTHORIZED,
			message: "Sorry, your email address isn't verified yet!",
		});
	}

	if (!user.isActive) {
		throw new CustomError({
			status: STATUS.UNAUTHORIZED,
			code: CODE.UNAUTHORIZED,
			message: "Sorry, your account is deactivated!",
		});
	}

	if (user.isTempDeleted) {
		throw new CustomError({
			status: STATUS.UNAUTHORIZED,
			code: CODE.UNAUTHORIZED,
			message: "Sorry, your account is temporarily deleted!",
		});
	}

	const isPasswordCorrect = await verify_hash({
		plainText: password,
		hash: user.password,
	});

	if (!isPasswordCorrect) {
		throw new CustomError({
			status: STATUS.UNAUTHORIZED,
			code: CODE.UNAUTHORIZED,
			message: "Sorry, email or password are incorrect!",
		});
	}

	return await give_access({ user });
};

const logout_POST_service = async ({ userId, accessToken }) => {
	const isUserLoggedOut = await Session.findOneAndDelete({
		userId,
		accessToken,
	});

	if (!isUserLoggedOut) {
		throw new CustomError("ProcessFailed", "Sorry, the logout attempt failed");
	}

	return "Logged out successfully";
};

module.exports = {
	signUp_POST_service,
	verify_GET_service,
	login_POST_service,
	logout_POST_service,
};
