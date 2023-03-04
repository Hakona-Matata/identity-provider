const {
	generate_token,
	verify_token,
	give_access,
} = require("./../../helpers/token");
const { generate_hash, verify_hash } = require("./../../helpers/hash");
const CustomError = require("./../../Errors/CustomError");

const User = require("./../Models/User.model");
const Session = require("../Models/Session.model");
const sendEmail = require("./../../helpers/email");

const signUp_POST_service = async (data) => {
	// (1) Create user from given payload
	const user = new User({
		...data,
		password: await generate_hash(data.password),
	});

	// (2) Create verification token
	const verificationToken = await generate_token({
		payload: { _id: user._id },
		secret: process.env.VERIFICATION_TOKEN_SECRET,
		expiresIn: process.env.VERIFICATION_TOKEN_EXPIRES_IN,
	});

	// (3) Create verification link
	const link = `${process.env.BASE_URL}:${process.env.PORT}/auth/verify-email/${verificationToken}`;

	// (4) Send Verification email to user mailbox
	await sendEmail({
		from: "Hakona Matata company",
		to: user.email,
		subject: "Email Verification",
		text: `Hello, ${user.email}\nPlease click the link to verify your email (It's only valid for ${process.env.VERIFICATION_TOKEN_EXPIRES_IN})\n${link}\nthanks.`,
	});

	// (5) Update user document
	user.verificationToken = verificationToken;

	// (6) Save user into our DB
	await user.save();

	return "Please, check your mailbox to verify your email address.";
};

const verify_GET_service = async (data) => {
	// (1) Verify token
	const decoded = await verify_token({
		token: data.verificationToken,
		secret: process.env.VERIFICATION_TOKEN_SECRET,
	});

	// (2) Get user document
	const user = await User.findOne({
		_id: decoded._id,
	})
		.select("verificationToken isVerified")
		.lean();

	if (!user.verificationToken && user.isVerified === true) {
		throw new CustomError("InvalidInput", "Your account is already verified!");
	}

	// (3) Update and save user into our DB
	await User.findOneAndUpdate(
		{ _id: decoded._id },
		{
			$set: { isVerified: true, isVerifiedAt: new Date() },
			$unset: { verificationToken: 1 },
		}
	);

	return "Your account is verified successfully";
};

const login_POST_service = async (data) => {
	// (1) Get user from DB
	const user = await User.findOne({ email: data.email })
		.select("password isVerified isActive isOTPEnabled isSMSEnabled")
		.lean();

	if (!user) {
		throw new CustomError("InvalidInput", "Email or password is incorrect!");
	}

	// (2) Check password
	const isPasswordCorrect = await verify_hash({
		plainText: data.password,
		hash: user.password,
	});

	if (!isPasswordCorrect) {
		throw new CustomError("InvalidInput", "Email or password is incorrect!");
	}

	// (3) Check email verification status
	if (!user.isVerified) {
		throw new CustomError(
			"UnAuthorized",
			"Sorry, your email address isn't verified yet!"
		);
	}

	// (4) Check fore account activation status
	if (!user.isActive) {
		throw new CustomError(
			"UnAuthorized",
			"Sorry, you need to activate your email first!"
		);
	}

	// (5) Check for all the enabled methods as 2FA!
	const enabledMethods = [];

	if (user.isOTPEnabled) {
		enabledMethods.push({ isOTPEnabled: true });
	}

	if (user.isSMSEnabled) {
		enabledMethods.push({ isSMSEnabled: true });
	}

	// (5) The frontend should show the user all the enabled methods, so he can choose whatever he wants
	if (enabledMethods.length >= 1) {
		return {
			message: "Please, choose one of the given 2FA methods!",
			userId: user._id,
			methods: enabledMethods,
		};
	}

	// (6) If no methods are enabled, then just give him needed tokens!
	return await give_access({ userId: user._id });
};

const logout_POST_service = async ({ userId, accessToken }) => {
	const done = await Session.findOneAndDelete({
		userId,
		accessToken,
	});

	if (!done) {
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
