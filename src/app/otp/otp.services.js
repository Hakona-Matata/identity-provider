const {
	SUCCESS_MESSAGES: { CHECK_MAILBOX_FOR_OTP, OTP_CONFIRMED_SUCCESSFULLY, OTP_DISABLED_SUCCESSFULLY },
	FAILURE_MESSAGES: { OTP_ALREADY_ENABLED, ALREADY_HAVE_VALID_OTP, EXPIRED_OTP, INVALID_OTP, OTP_ALREADY_DISABLED },
} = require("./otp.constants");

const OTPRepository = require("./otp.repository");
const AccountRepository = require("./../account/account.repositories");

const HashHelper = require("./../../helpers/hash");
const RandomHelper = require("./../../helpers/random");

const BadRequestException = require("./../../Exceptions/common/badRequest.exception");
const ForbiddenException = require("./../../Exceptions/common/forbidden.exception");
class OTPServices {
	static async enable({ accountId, isOTPEnabled }) {
		OTPServices.#isOTPAlreadyEnabled(isOTPEnabled);

		const isOTPFound = await OTPRepository.findOne(accountId);

		if (isOTPFound) {
			throw new BadRequestException(ALREADY_HAVE_VALID_OTP);
		}

		return await OTPServices.#generateSaveHashedOTP(accountId);
	}

	static async confirm({ accountId, givenOTP }) {
		const OTPFound = await OTPRepository.findOne(accountId);

		if (!OTPFound) {
			throw new BadRequestException(EXPIRED_OTP);
		}

		const isOTPValid = await HashHelper.verify(givenOTP, OTPFound.hashedOTP);

		if (!isOTPValid) {
			throw new ForbiddenException(INVALID_OTP);
		}

		await OTPRepository.deleteOne(OTPFound._id);

		await AccountRepository.updateOne(OTPFound.accountId, { isOTPEnabled: true, OTPEnabledAt: new Date() });

		return OTP_CONFIRMED_SUCCESSFULLY;
	}

	static async disable(accountId) {
		const account = await AccountRepository.findOneById(accountId);

		await OTPServices.#isOTPAlreadyDisabled(account.isOTPEnabled);

		await AccountRepository.updateOne(accountId, { isOTPEnabled: false }, { OTPEnabledAt: 1 });

		return OTP_DISABLED_SUCCESSFULLY;
	}

	static async send(accountId) {
		const OTPFound = await OTPRepository.findOne(accountId);

		if (OTPFound) {
			throw new BadRequestException(ALREADY_HAVE_VALID_OTP);
		}

		return await OTPServices.#generateSaveHashedOTP(accountId);
	}

	static async verify() {}

	static #isOTPAlreadyEnabled(isOTPEnabled) {
		if (isOTPEnabled) {
			throw new BadRequestException(OTP_ALREADY_ENABLED);
		}
	}

	static #isOTPAlreadyDisabled(isOTPEnabled) {
		if (!isOTPEnabled) {
			throw new BadRequestException(OTP_ALREADY_DISABLED);
		}
	}

	static async #generateSaveHashedOTP(accountId) {
		const plainTextOTP = RandomHelper.generateRandomNumber(6);

		const hashedOTP = await HashHelper.generate(plainTextOTP);

		// TODO: Send email
		console.log({ plainTextOTP, hashedOTP });

		await OTPRepository.create({ accountId, hashedOTP });

		return CHECK_MAILBOX_FOR_OTP;
	}
}

module.exports = OTPServices;
