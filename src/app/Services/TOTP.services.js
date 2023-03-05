const { generate_secret } = require("./../../helpers/totp");
const Encrypter = require("./../../helpers/crypto");
const CustomError = require("./../../Errors/CustomError");

const User = require("./../Models/User.model");
const TOTP = require("./../Models/TOTP.model");

const enableTOTP_POST_service = async ({ userId, isTOTPEnabled }) => {
	if (isTOTPEnabled) {
		throw new CustomError("AlreadyDone", "Sorry, you already enabled TOTP!");
	}

	// (1) Create TOTP secret!
	const secret = await generate_secret();
	console.log({ secret });

	// (2) Encrypt TOTP secret!
	const encrypter = new Encrypter(process.env.TOTP_ENCRYPTION_KEY);
	const encryptedSecret = encrypter.encrypt(secret);

	// (3) Now, we can Save that encrypted secret in our DB!
	const done = await TOTP.create({ userId, secret: encryptedSecret });

	if (!done) {
		throw new CustomError("ProcessFailed", "Sorry, Enable TOTP failed");
	}

	// (4) Return secret to client side, so they can create a QR code
	return { secret };
};

module.exports = { enableTOTP_POST_service };
