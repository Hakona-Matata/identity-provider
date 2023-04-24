const HashHelper = require("./../../helpers/hash");
const RandomHelper = require("./../../helpers/random");

const AccountServices = require("./../account/account.services");
const SessionServices = require("./../session/session.services");
const OtpRepository = require("./otp.repository");

const {
	SUCCESS_MESSAGES: {
		OTP_SENT_SUCCESSFULLY,
		OTP_CONFIRMED_SUCCESSFULLY,
		OTP_DISABLED_SUCCESSFULLY,
		OTP_VERIFIED_SUCCESSFULLY,
	},
	FAILURE_MESSAGES: {
		OTP_ALREADY_ENABLED,
		ALREADY_HAVE_VALID_OTP,
		EXPIRED_OTP,
		INVALID_OTP,
		OTP_ALREADY_DISABLED,
		REACHED_MAXIMUM_WRONG_TRIES,
		OTP_CREATION_FAILED,
		OTP_DELETION_FAILED,
		OTP_NOT_FOUND,
	},
} = require("./otp.constants");

const {
	BadRequestException,
	ForbiddenException,
	InternalServerException,
	NotFoundException,
} = require("./../../Exceptions/index");

class OtpServices {
	/* 
		=======================================
			Public methods 
		=======================================
	*/
	static async enable(accountId, isOtpEnabled) {
		if (isOtpEnabled) {
			throw new BadRequestException(OTP_ALREADY_ENABLED);
		}

		return await OtpServices.#generateSaveSendOtp(accountId);
	}

	static async confirm(accountId, givenOtp) {
		const account = await AccountServices.findById(accountId);

		if (account.isOtpEnabled) {
			throw new BadRequestException(OTP_ALREADY_ENABLED);
		}

		await OtpServices.#verifyDeleteOtp(accountId, givenOtp);

		await AccountServices.updateOne({ _id: accountId }, { isOtpEnabled: true, otpEnabledAt: new Date() });

		return OTP_CONFIRMED_SUCCESSFULLY;
	}

	static async disable(accountId, isOtpEnabled) {
		if (!isOtpEnabled) {
			throw new BadRequestException(OTP_ALREADY_DISABLED);
		}

		await AccountServices.updateOne({ _id: accountId }, { isOtpEnabled: false }, { OtpEnabledAt: 1 });

		return OTP_DISABLED_SUCCESSFULLY;
	}

	static async send(accountId) {
		return await OtpServices.#generateSaveSendOtp(accountId);
	}

	static async verify(accountId, givenOtp) {
		await OtpServices.#verifyDeleteOtp(accountId, givenOtp);

		const account = await AccountServices.findById(accountId);

		return await SessionServices.createOne({ accountId: account._id, role: account.role });
	}

	static async generatSendOtp() {
		const plainTextOtp = RandomHelper.generateRandomNumber(6);

		const hashedOtp = await HashHelper.generate(plainTextOtp);

		// TODO: Send email
		console.log({ plainTextOtp, hashedOtp });

		return hashedOtp;
	}

	/* 
		=======================================
			Private methods 
		=======================================
	*/

	static async #generateSaveSendOtp(accountId) {
		const isOtpFound = await OtpServices.findOne({ accountId });

		if (isOtpFound) {
			throw new BadRequestException(ALREADY_HAVE_VALID_OTP);
		}

		const hashedOtp = await OtpServices.generatSendOtp(accountId);

		await OtpServices.createOne({ accountId, hashedOtp });

		return OTP_SENT_SUCCESSFULLY;
	}

	static async #verifyDeleteOtp(accountId, givenOtp) {
		const foundOtp = await OtpServices.findOne({ accountId });

		if (!foundOtp) {
			throw new ForbiddenException(EXPIRED_OTP);
		}

		if (foundOtp.count >= 3) {
			await OtpServices.deleteOne({ _id: foundOtp._id });

			throw new ForbiddenException(REACHED_MAXIMUM_WRONG_TRIES);
		}

		const isOtpValid = await HashHelper.verify(givenOtp, foundOtp.hashedOtp);

		if (!isOtpValid) {
			await OtpServices.updateOne({ _id: foundOtp._id }, { count: foundOtp.count + 1 });

			throw new ForbiddenException(INVALID_OTP);
		}

		await OtpServices.deleteOne({ _id: foundOtp._id });
	}

	/* 
		=======================================
			CRUD methods 
		=======================================
	*/

	static async createOne(payload) {
		const isOtpCreated = await OtpRepository.insertOne(payload);

		if (!isOtpCreated) {
			throw new InternalServerException(OTP_CREATION_FAILED);
		}

		return isOtpCreated;
	}

	static async findOne(payload) {
		return await OtpRepository.findOne(payload);
	}

	static async updateOne(filter, setPayload, unsetPayload) {
		return await OtpRepository.updateOne(filter, setPayload, unsetPayload);
	}

	static async deleteOne(filter) {
		const isOtpDeleted = await OtpRepository.deleteOne(filter);

		if (!isOtpDeleted) {
			throw new NotFoundException(OTP_NOT_FOUND);
		} else if (isOtpDeleted.deletedCount === 0) {
			throw new InternalServerException(OTP_DELETION_FAILED);
		}
	}
}

module.exports = OtpServices;
