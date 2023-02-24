const { generate_token, verify_token } = require("./../../helpers/token");
const { create_hash, verify_hash } = require("./../../helpers/hash");
const CustomError = require("./../../Errors/CustomError");

const User = require("./../Models/User.model");
const sendEmail = require("./../../helpers/email");
//======================================================

const signUp_POST_service = async (data) => {
	// (1) Create user from given payload
	const user = new User({
		...data,
		password: await create_hash(data.password),
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

module.exports = {
	signUp_POST_service,
	verify_GET_service,
};