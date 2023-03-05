const { generate_secret, verify_totp } = require("./../../helpers/totp");
const Encrypter = require("./../../helpers/crypto");
const CustomError = require("./../../Errors/CustomError");

const User = require("./../Models/User.model");
const TOTP = require("./../Models/TOTP.model");
const {
	CustomerProfilesChannelEndpointAssignmentContextImpl,
} = require("twilio/lib/rest/trusthub/v1/customerProfiles/customerProfilesChannelEndpointAssignment");

const enableTOTP_POST_service = async ({ userId, isTOTPEnabled }) => {
	if (isTOTPEnabled) {
		throw new CustomError("AlreadyDone", "Sorry, you already enabled TOTP!");
	}

	// (1) Delete all the old created totps || he is starting from scratch now!
	await TOTP.deleteMany({ userId });

	// (2) Create TOTP secret!
	const secret = await generate_secret();

	// (3) Encrypt TOTP secret!
	const encrypter = new Encrypter(process.env.TOTP_ENCRYPTION_KEY);
	const encryptedSecret = encrypter.encrypt(secret);

	// (4) Now, we can Save that encrypted secret in our DB!
	const done = await TOTP.create({ userId, secret: encryptedSecret });

	if (!done) {
		throw new CustomError("ProcessFailed", "Sorry, Enable TOTP failed");
	}

	// (5) Return secret to client side, so they can create a QR code
	return { secret };
};

const confirmTOTP_POST_service = async ({ userId, givenTOTP }) => {
	// (1) Get TOTP from DB
	const totp = await TOTP.findOne({ userId }).select("secret count").lean();

	if (!totp) {
		// check if user really asked for enabling totp!
		throw new CustomError(
			"InvalidInput",
			"Sorry, you can't confirm TOTP before setting it up!"
		);
	}

	if (totp && totp.count > 3) {
		// If the user keeps sending wrong totp during setup, then, that means the secret used in
		// creating the QR Code is wrong, so delete it and start from scratch!
		await TOTP.findOneAndDelete({ _id: totp._id });

		throw new CustomError(
			"UnAuthorized",
			"Sorry, you need to start from scratch!"
		);
	}

	// (2) Decrypt secret
	const encrypter = new Encrypter(process.env.TOTP_ENCRYPTION_KEY);
	const decryptedSecret = encrypter.dencrypt(totp.secret);

	// (3) Verify given TOTP aganist decrypted secret!
	const isTOTPValid = await verify_totp({
		token: givenTOTP,
		secret: decryptedSecret,
	});

	if (!isTOTPValid) {
		await TOTP.findOneAndUpdate(
			{ _id: totp._id },
			{ $set: { count: totp.count + 1 } }
		);

		throw new CustomError("InvalidInput", "Sorry, the given code is invalid");
	}

	// (4) convert TOTP secret from temporary to permanant!
	await TOTP.findOneAndUpdate(
		{ _id: totp._id },
		{
			$set: { isSecretTemp: false },
		}
	);

	// (5) Update user document
	const done = await User.findOneAndUpdate(
		{ _id: userId },
		{
			$set: { isTOTPEnabled: true, TOTPEnabledAt: new Date() },
		}
	);

	if (!done) {
		throw new CustomError("ProcessFailed", "Sorry, Confirm TOTP failed");
	}

	return "TOTP enabled successfully!";
};

module.exports = { enableTOTP_POST_service, confirmTOTP_POST_service };
