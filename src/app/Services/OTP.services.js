const User = require("./../Models/User.model");
const OTP = require("./../Models/OTP.model");
const { generate_randomNumber } = require("./../../helpers/randomNumber");
const { generate_hash, verify_hash } = require("./../../helpers/hash");
const sendEmail = require("./../../helpers/email");
const CustomError = require("./../../Errors/CustomError");

const enableOTP_GET_service = async ({ userId, email, isOTPEnabled }) => {
	// TODO: make this check in the middleware!
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

module.exports = { enableOTP_GET_service, confirmOTP_POST_service };
