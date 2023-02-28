const User = require("./../Models/User.model");
const { generate_token, verify_token } = require("./../../helpers/token");
const sendEmail = require("./../../helpers/email");
const CustomError = require("./../../Errors/CustomError");

const deactivateAccount_PUT_service = async ({ userId }) => {
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
		return `Please, check your mailbox to confirm your account activation\nYou only have ${process.env.ACTIVATION_TOKEN_EXPIRES_IN}`;
	}

	if (user.isActive) {
		throw new Error("Sorry, your account is already active!");
	}

	/* 
        If already have a valid one
        then don't create a new one!
	
    */
	if (user.activationToken) {
		const decoded = await verify_token({
			token: user.activationToken,
			secret: process.env.ACTIVATION_TOKEN_SECRET,
		});

		if (decoded) {
			throw new Error("Sorry, you still have a valid link in your mailbox!");
		}
	}

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
	return `Please, check your mailbox to confirm your account activation\nYou only have ${process.env.ACTIVATION_TOKEN_EXPIRES_IN}`;
};

const confirmActivation_GET_service = async ({ activationToken }) => {
	// (1) Verify activation token
	const decoded = await verify_token({
		token: activationToken,
		secret: process.env.ACTIVATION_TOKEN_SECRET,
	});

	// (2) Get user from DB and check if the this token is actually assigned to him!
	const user = await User.findOne({ _id: decoded._id, activationToken })
		.select("activationToken")
		.lean();

	if (!user) {
		throw new CustomError(
			"UnAuthorized",
			"Sorry, you already confirmed your email activation!"
		);
	}

	// (3 Update user document
	const done = await User.findOneAndUpdate(
		{ _id: decoded._id },
		{
			$set: { isActive: true, activeStatusChangedAt: new Date() },
			$unset: { activationToken: 1 },
		}
	);

	if (!done) {
		throw new Error("Sorry, 'Email Activation' confirm failed");
	}

	// client side should redirect to login page or so!
	return "Account is activated successfully";
};

const deleteAccount_DELETE_service = async ({ userId }) => {
	const done = await User.findOneAndUpdate(
		{ _id: userId },
		{
			$set: { isDeleted: true, isDeletedAt: new Date() },
		}
	).select("_id");

	if (!done) {
		throw new Error("Sorry, Account deletion failed");
	}

	return "Account deleted successfully!\n(It Will be deleted permenantly after 30 days)";
};

module.exports = {
	deactivateAccount_PUT_service,
	activateAccount_PUT_service,
	confirmActivation_GET_service,
	deleteAccount_DELETE_service,
};
