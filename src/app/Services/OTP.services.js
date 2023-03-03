const User = require("./../Models/User.model");
const OTP = require("./../Models/OTP.model");
const { generate_randomNumber } = require("./../../helpers/randomNumber");
const { generate_hash, verify_hash } = require("./../../helpers/hash");
const sendEmail = require("./../../helpers/email");
const CustomError = require("./../../Errors/CustomError");
const { give_access } = require("./../../helpers/token");

const enableOTP_GET_service = async ({ userId, email, isOTPEnabled }) => {
	if (isOTPEnabled) {
		throw new CustomError("AlreadyDone", "Sorry, you already enabled OTP!");
	}

	// (1) Check if we already assigned him an OTP!
	const otp = await OTP.findOne({ userId }).select("_id").lean();

	if (otp) {
		throw new CustomError(
			"AlreadyDone",
			"Sorry, you still have a valid OTP in your mailbox!"
		);
	}

	// (2) Generate OTP | 6 random numbers
	const plainTextOTP = generate_randomNumber({ length: 6 });

	// (3) Hash OTP!
	const hashedOTP = await generate_hash(`${plainTextOTP}`);

	// (4) Send OTP to user mailbox
	await sendEmail({
		from: "Hakona Matata company",
		to: email,
		subject: "Identity check (OTP)",
		text: `Hello, ${email}\nThis code "${plainTextOTP}" is only valid for ${
			process.env.OTP_EXPIRES_IN_SECONDS / 60
		} minutes\nThanks`,
	});

	// (5) Save it into DB
	await OTP.create({ userId, otp: hashedOTP });

	return "Please, check your mailbox for the OTP code";
};

const confirmOTP_POST_service = async ({ userId, givenOTP }) => {
	// (1) Get OTP from DB
	const otp = await OTP.findOne({ userId }).select("otp").lean();

	if (!otp) {
		throw new CustomError("UnAuthorized", "Sorry, your OTP may be expired!");
	}

	// (2) Check given OTP
	const isOTPValid = await verify_hash({
		plainText: `${givenOTP}`,
		hash: otp.otp,
	});

	if (!isOTPValid) {
		throw new CustomError("UnAuthorized", "Sorry, your OTP is invalid!");
	}

	// (3) update user document
	const done = await User.findOneAndUpdate(
		{ _id: userId },
		{
			$set: { isOTPEnabled: true, OTPEnabledAt: new Date() },
		}
	);

	if (!done) {
		throw new CustomError("ProcessFailed", "Sorry, OTP confirmation failed");
	}

	return "OTP is enabled successfully";
};

const DisableOTP_DELETE_service = async ({ userId }) => {
	const user = await User.findOne({ _id: userId })
		.select("isOTPEnabled")
		.lean();

	if (!user || !user.isOTPEnabled) {
		throw new CustomError("AlreadyDone", "Sorry, you already disabled OTP!");
	}

	const done = await User.findOneAndUpdate(
		{ _id: userId },
		{
			$set: { isOTPEnabled: false },
			$unset: { OTPEnabledAt: 1 },
		}
	);

	if (!done) {
		throw new CustomError("ProcessFailed", "Sorry, Disable OTP failed");
	}

	return "You disabled OTP successfully";
};

const sendOTP_POST_service = async ({ userId, email }) => {
	// (1) Check if we already assigned him one!
	const otp = await OTP.findOne({ userId }).select("_id").lean();

	if (otp) {
		throw new CustomError(
			"AlreadyDone",
			"Sorry, we already sent you OTP and it's still valid!"
		);
	}

	// (2) Generate OTP | 6 random numbers
	const plainTextOTP = generate_randomNumber({ length: 6 });

	// (3) Hash OTP!
	const hashedOTP = await generate_hash(`${plainTextOTP}`);

	// (4) Send OTP to user mailbox
	await sendEmail({
		from: "Hakona Matata company",
		to: email,
		subject: "Identity check (OTP)",
		text: `Hello, ${email}\nThis OTP code "${plainTextOTP}" is only valid for ${
			process.env.OTP_EXPIRES_IN_SECONDS / 60
		} minutes\nThanks`,
	});

	// (5) Save it into DB
	await OTP.create({ userId, otp: hashedOTP });

	return "Please, check your mailbox for the OTP code";
};

const verifyOTP_POST_service = async ({ userId, givenOTP }) => {
	// (1) Get OTP form DB | check if I really assined him an OTP!
	const otp = await OTP.findOne({ userId }).lean();

	if (!otp) {
		throw new CustomError("UnAuthorized", "Sorry, the OTP may be expired!");
	}

	// (2) Check for how many wrong tries he doing!
	if (otp.count >= 3) {
		await OTP.findOneAndDelete({ _id: otp._id });

		throw new CustomError(
			"UnAuthorized",
			"Sorry, You have reached your maximum wrong tries!"
		);
	}

	// (3) Check validity of the given OTP
	const isOTPValid = await verify_hash({
		plainText: `${givenOTP}`,
		hash: otp.otp,
	});

	if (!isOTPValid) {
		// If it was invalid, then increase the count of the wrong tries!
		await OTP.findOneAndUpdate(
			{ _id: otp._id },
			{ $set: { count: otp.count + 1 } }
		);

		throw new CustomError("UnAuthorized", "Sorry, your OTP is invalid!");
	}

	// (4) If everyting goes well, then don't wait for automatic deleteing, do it now!
	await OTP.findOneAndDelete({ _id: otp._id });

	// (5) Return access and refresh tokens!
	return await give_access({ userId });
};

module.exports = {
	// During setup
	enableOTP_GET_service,
	confirmOTP_POST_service,
	DisableOTP_DELETE_service,

	// During login process
	sendOTP_POST_service,
	verifyOTP_POST_service,
};
