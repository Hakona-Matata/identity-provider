const User = require("./../Models/User.model");
const OTP = require("./../Models/OTP.model");
const { send_SMS } = require("./../../helpers/SMS");
const { generate_randomNumber } = require("./../../helpers/randomNumber");
const { generate_hash, verify_hash } = require("./../../helpers/hash");
const CustomError = require("./../../Errors/CustomError");

const enableSMS_POST_service = async ({
	userId,
	isSMSEnabled,
	phoneNumber,
	countryCode,
	countryName,
	countryIso2,
}) => {
	if (isSMSEnabled) {
		throw new CustomError("AlreadyDone", "Sorry, you already enabled SMS!");
	}

	// (1) Check if we already assigned him an OTP!
	const otp = await OTP.findOne({ userId, by: "SMS" }).select("_id").lean();

	if (otp) {
		throw new CustomError(
			"AlreadyDone",
			"Sorry, the OTP sent to your phone is still valid!"
		);
	}

	// (2) Generate OTP | 6 random numbers
	const plainTextOTP = generate_randomNumber({ length: 6 });

	// (3) Hash OTP!
	const hashedOTP = await generate_hash(`${plainTextOTP}`);

	// (4) Send SMS
	await send_SMS({
		phoneNumber,
		message: `OTP: ${plainTextOTP}\nIt's valid only for ${
			process.env.OTP_EXPIRES_IN_SECONDS / 60
		} minutes`,
	});

	// (5) Save it into DB
	await OTP.create({ userId, otp: hashedOTP, by: "SMS" });

	// (6) Update user document
	const done = await User.findOneAndUpdate(
		{ _id: userId },
		{
			$set: {
				phoneNumber,
				countryCode,
				countryName,
				countryIso2,
			},
		}
	);

	if (!done) {
		/*
            If the process wasn't successfull, then don't save those phone and country info!
        */
		await User.findOneAndUpdate(
			{ _id: userId },
			{
				$unset: {
					phoneNumber,
					countryCode,
					countryName,
					countryIso2,
				},
			}
		);

		throw new Customer("ProcessFailed", "Sorry, Enable SMS failed");
	}

	return "OTP code sent to your phone successfully";
};

const confirmSMS_POST_service = async ({ userId, givenOTP }) => {
	// (1) Get OTP from DB
	const otp = await OTP.findOne({ userId, by: "SMS" }).select("otp").lean();

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

	// (3) Delete OTP | Don't wait for the automatic deletion!
	await OTP.findOneAndDelete({ _id: otp._id });

	// (4) update user document
	const done = await User.findOneAndUpdate(
		{ _id: userId },
		{
			$set: { isSMSEnabled: true, SMSEnabledAt: new Date() },
		}
	);

	if (!done) {
		throw new CustomError(
			"ProcessFailed",
			"Sorry, OTP over SMS confirmation failed"
		);
	}

	return "OTP over SMS is enabled successfully";
};

const disableSMS_delete_service = async ({ userId }) => {
	const user = await User.findOne({ _id: userId })
		.select("isSMSEnabled")
		.lean();

	if (!user || !user.isSMSEnabled) {
		throw new CustomError(
			"AlreadyDone",
			"Sorry, you already disabled OTP over SMS!"
		);
	}

	const done = await User.findOneAndUpdate(
		{ _id: userId },
		{
			$set: { isSMSEnabled: false },
			$unset: { SMSEnabledAt: 1 },
		}
	);

	if (!done) {
		throw new CustomError(
			"ProcessFailed",
			"Sorry, Disable OTP over SMS failed"
		);
	}

	return "You disabled OTP over SMS successfully";
};

module.exports = {
	enableSMS_POST_service,
	confirmSMS_POST_service,
	disableSMS_delete_service,
};
