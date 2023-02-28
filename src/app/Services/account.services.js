const User = require("./../Models/User.model");
const { generate_token, verify_token } = require("./../../helpers/token");
const sendEmail = require("./../../helpers/email");

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

const activateAccount_PUT_service = async ({ email }) => {
	const user = await User.findOne({ email })
		.select("email isActive activationToken")
		.lean();

	if (!user) {
		return "Please, check your mailbox!";
	}

	if (user.isActive) {
		return "Your account is already active!";
	}

	await verify_token({
		token: user.activationToken,
		secret: process.env.ACTIVATION_TOKEN_SECRET,
	}).catch((error) => {
		console.log(error);
	});
	// tODO:
	console.log("good");

	const activationToken = await generate_token({
		payload: { _id: user._id },
		secret: process.env.ACTIVATION_TOKEN_SECRET,
		expiresIn: process.env.ACTIVATION_TOKEN_EXPIRES_IN,
	});

	const activationLink = `${process.env.BASE_URL}:${process.env.PORT}/auth/account/activate/${activationToken}`;

	await sendEmail({
		from: "Hakona Matata company",
		to: user.email,
		subject: "Email Activation",
		text: `Hello, ${user.email}\nPlease click the link to activate your email (It's only valid for ${process.env.ACTIVATION_TOKEN_EXPIRES_IN})\n${activationLink}\nthanks.`,
	});

	const done = await User.findOneAndUpdate(
		{ email },
		{ $set: { activationToken } }
	).select("_id");

	if (!done) {
		throw new Error("Sorry, Email Activation failed");
	}

	// On the client side should be redirected to login page or so
	return `Please, chech your mailbox to confirm your account activation\nYou only have ${process.env.ACTIVATION_TOKEN_EXPIRES_IN}`;
};

module.exports = {
	deactivateAccount_PUT_service,
	activateAccount_PUT_service,
};
