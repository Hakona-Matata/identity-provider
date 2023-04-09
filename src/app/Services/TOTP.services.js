const CustomError = require("./../../Exceptions/CustomError");
const STATUS = require("../../constants/statusCodes");
const CODE = require("../../constants/errorCodes");

const { verify_totp } = require("./../../helpers/totp");
const generate_secret = require("./.././../helpers/randomString");
const { give_access } = require("./../../helpers/token");
const Encrypter = require("./../../helpers/crypto");

const User = require("./../Models/User.model");
const TOTP = require("./../Models/TOTP.model");

const enableTOTP_POST_service = async ({ userId, isTOTPEnabled }) => {
	if (isTOTPEnabled) {
		throw new CustomError({
			status: STATUS.UNAUTHORIZED,
			code: CODE.UNAUTHORIZED,
			message: "Sorry, you already enabled TOTP!",
		});
	}

	await TOTP.deleteMany({ userId });

	const secret = generate_secret();
	const encrypter = new Encrypter(process.env.TOTP_ENCRYPTION_KEY);
	const encryptedSecret = encrypter.encrypt(secret);

	const isTOTPCreated = await TOTP.create({ userId, secret: encryptedSecret });

	if (!isTOTPCreated) {
		throw new CustomError({
			status: STATUS.INTERNAL_SERVER_ERROR,
			code: CODE.INTERNAL_SERVER_ERROR,
			message: "Sorry, Enable TOTP failed",
		});
	}

	return { secret };
};

const confirmTOTP_POST_service = async ({ userId, givenTOTP }) => {
	const foundUserTOTP = await TOTP.findOne({ userId })
		.select("secret isSecretTemp count")
		.lean();

	if (!foundUserTOTP) {
		throw new CustomError({
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, you can't confirm TOTP before setting it up!",
		});
	}

	if (!foundUserTOTP.isSecretTemp) {
		throw new CustomError({
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, you already confirmed TOTP!",
		});
	}

	if (foundUserTOTP.count >= 3) {
		await TOTP.findOneAndDelete({ _id: foundUserTOTP._id });

		throw new CustomError({
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, you need to start from scratch!",
		});
	}

	const encrypter = new Encrypter(process.env.TOTP_ENCRYPTION_KEY);
	const decryptedSecret = encrypter.dencrypt(foundUserTOTP.secret);

	const isTOTPValid = await verify_totp({
		token: givenTOTP,
		secret: decryptedSecret,
	});

	if (!isTOTPValid) {
		await TOTP.findOneAndUpdate(
			{ _id: foundUserTOTP._id },
			{ $set: { count: foundUserTOTP.count + 1 } }
		);

		throw new CustomError({
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, the given code is invalid!",
		});
	}

	const isTOTPConfirmed = await TOTP.findOneAndUpdate(
		{ _id: foundUserTOTP._id },
		{
			$set: { isSecretTemp: false },
			$unset: { count: 1 },
		}
	);

	if (!isTOTPConfirmed) {
		throw new CustomError({
			status: STATUS.INTERNAL_SERVER_ERROR,
			code: CODE.INTERNAL_SERVER_ERROR,
			message: "Sorry, TOTP confirmation failed.",
		});
	}

	const isTOTPEnabled = await User.findOneAndUpdate(
		{ _id: userId },
		{
			$set: { isTOTPEnabled: true, TOTPEnabledAt: new Date() },
		}
	);

	if (!isTOTPEnabled) {
		throw new CustomError({
			status: STATUS.INTERNAL_SERVER_ERROR,
			code: CODE.INTERNAL_SERVER_ERROR,
			message: "Sorry, Confirm TOTP failed",
		});
	}

	return "TOTP enabled successfully!";
};

const disableTOTP_DELETE_service = async ({ userId }) => {
	const user = await User.findOne({ _id: userId })
		.select("isTOTPEnabled")
		.lean();

	if (user && !user.isTOTPEnabled) {
		throw new CustomError("UnAuthorized", "Sorry, you already disabled TOTP!");
	}

	await TOTP.findOneAndDelete({ userId });

	const done = await User.findOneAndUpdate(
		{ _id: userId },
		{
			$set: { isTOTPEnabled: false },
			$unset: { TOTPEnabledAt: 1 },
		}
	);

	if (!done) {
		throw new CustomError("ProcessFailed", "Sorry, disable TOTP failed");
	}

	return "TOTP disabled successfully!";
};

const verifyTOTP_POST_service = async ({ userId, givenTOTP }) => {
	// (1) Get user form DB
	const user = await User.findOne({ _id: userId })
		.select("isTOTPEnabled")
		.lean();

	if (!user) {
		throw new CustomError("UnAuthorized", "Sorry, the given code is invalid");
	}

	if (user && !user.isTOTPEnabled) {
		throw new CustomError("UnAuthorized", "Sorry, TOTP is not enabled!");
	}

	// (2) Get assined TOTP secret from DB
	const totp = await TOTP.findOne({ userId }).select("secret").lean();

	// (3) Decrypt secret
	const encrypter = new Encrypter(process.env.TOTP_ENCRYPTION_KEY);
	const decryptedSecret = encrypter.dencrypt(totp.secret);

	// (4) Verify given TOTP aganist decrypted secret!
	const isTOTPValid = await verify_totp({
		token: givenTOTP,
		secret: decryptedSecret,
	});

	if (!isTOTPValid) {
		throw new CustomError("InvalidInput", "Sorry, the given code is invalid");
	}

	// (5) Return access and refresh tokens!
	return await give_access({ userId });
};

module.exports = {
	enableTOTP_POST_service,
	confirmTOTP_POST_service,
	disableTOTP_DELETE_service,
	verifyTOTP_POST_service,
};
