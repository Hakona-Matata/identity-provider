const {
	SUCCESS_MESSAGES: { CHECK_MAILBOX_FOR_OTP, OTP_CONFIRMED_SUCCESSFULLY, OTP_DISABLED_SUCCESSFULLY },
	FAILURE_MESSAGES: {
		OTP_ALREADY_ENABLED,
		ALREADY_HAVE_VALID_OTP,
		EXPIRED_OTP,
		INVALID_OTP,
		OTP_ALREADY_DISABLED,
		REACHED_MAXIMUM_WRONG_TRIES,
	},
} = require("./otp.constants");

const OtpRepository = require("./otp.repository");
const AccountRepository = require("./../account/account.repositories");
const SessionServices = require("./../session/session.services");

const HashHelper = require("./../../helpers/hash");
const RandomHelper = require("./../../helpers/random");

const BadRequestException = require("./../../Exceptions/common/badRequest.exception");
const ForbiddenException = require("./../../Exceptions/common/forbidden.exception");

class OtpServices {
	static async enable({ accountId, isOtpEnabled }) {
		OtpServices.#isOtpAlreadyEnabled(isOtpEnabled);

		const isOtpFound = await OtpRepository.findOne(accountId);

		if (isOtpFound) {
			throw new BadRequestException(ALREADY_HAVE_VALID_OTP);
		}

		return await OtpServices.#generateSaveHashedOtp(accountId);
	}

	static async confirm({ accountId, givenOtp }) {
		const foundOtp = await OtpRepository.findOne(accountId);

		if (!foundOtp) {
			throw new BadRequestException(EXPIRED_OTP);
		}

		const isOtpValid = await HashHelper.verify(givenOtp, foundOtp.hashedOtp);

		if (!isOtpValid) {
			throw new ForbiddenException(INVALID_OTP);
		}

		await OtpRepository.deleteOne(foundOtp._id);

		await AccountRepository.updateOne(foundOtp.accountId, { isOtpEnabled: true, OtpEnabledAt: new Date() });

		return OTP_CONFIRMED_SUCCESSFULLY;
	}

	static async disable(accountId) {
		const account = await AccountRepository.findOneById(accountId);

		await OtpServices.#isOtpAlreadyDisabled(account.isOtpEnabled);

		await AccountRepository.updateOne(accountId, { isOtpEnabled: false }, { OtpEnabledAt: 1 });

		return OTP_DISABLED_SUCCESSFULLY;
	}

	static async send(accountId) {
		const foundOtp = await OtpRepository.findOne(accountId);

		if (foundOtp) {
			throw new BadRequestException(ALREADY_HAVE_VALID_OTP);
		}

		return await OtpServices.#generateSaveHashedOtp(accountId);
	}

	static async verify({ accountId, givenOtp }) {
		const foundOtp = await OtpRepository.findOne(accountId);

		if (!foundOtp) {
			throw new ForbiddenException(EXPIRED_OTP);
		}

		if (foundOtp.count >= 3) {
			await OtpRepository.deleteOne(foundOtp._id);

			throw new ForbiddenException(REACHED_MAXIMUM_WRONG_TRIES);
		}

		const isOtpValid = await HashHelper.verify(givenOtp, foundOtp.hashedOtp);

		if (!isOtpValid) {
			await OtpRepository.updateOne(foundOtp._id, { count: foundOtp.count + 1 });

			throw new ForbiddenException(INVALID_OTP);
		}

		await OtpRepository.deleteOne(foundOtp._id);

		const { role } = await AccountRepository.findOneById(accountId);

		return await SessionServices.create({ accountId, role });
	}

	static #isOtpAlreadyEnabled(isOtpEnabled) {
		if (isOtpEnabled) {
			throw new BadRequestException(OTP_ALREADY_ENABLED);
		}
	}

	static #isOtpAlreadyDisabled(isOtpEnabled) {
		if (!isOtpEnabled) {
			throw new BadRequestException(OTP_ALREADY_DISABLED);
		}
	}

	static async generatSendOtp() {
		const plainTextOtp = RandomHelper.generateRandomNumber(6);

		const hashedOtp = await HashHelper.generate(plainTextOtp);

		// TODO: Send email
		console.log({ plainTextOtp, hashedOtp });

		return hashedOtp;
	}

	static async #generateSaveHashedOtp(accountId) {
		const hashedOtp = await OtpServices.generatSendOtp(accountId);

		await OtpRepository.create({ accountId, hashedOtp });

		return CHECK_MAILBOX_FOR_OTP;
	}
}

module.exports = OtpServices;
