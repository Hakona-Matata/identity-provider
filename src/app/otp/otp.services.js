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

		OTP_CREATE_FAILED,
		OTP_READ_FAILED,
		OTP_UPDATE_FAILED,
		OTP_DELETE_FAILED,
	},
} = require("./otp.constants");

const OtpRepository = require("./otp.repository");
const AccountServices = require("./../account/account.services");

const HashHelper = require("./../../helpers/hash");
const RandomHelper = require("./../../helpers/random");

const { BadRequestException, ForbiddenException, InternalServerException } = require("./../../Exceptions/index");

class OtpServices {
	/* 
		=======================================
			Public methods 
		=======================================
	*/
	static async enable({ accountId, isOtpEnabled }) {
		if (isOtpEnabled) {
			throw new BadRequestException(OTP_ALREADY_ENABLED);
		}

		return await OtpServices.#generateSaveSendOtp(accountId);
	}

	static async confirm({ accountId, givenOtp }) {
		await OtpServices.#verifyDeleteOtp(accountId, givenOtp);

		await AccountServices.updateOne(accountId, { isOtpEnabled: true, otpEnabledAt: new Date() });

		return OTP_CONFIRMED_SUCCESSFULLY;
	}

	static async disable({ accountId, isOtpEnabled }) {
		if (!isOtpEnabled) {
			throw new BadRequestException(OTP_ALREADY_DISABLED);
		}

		await AccountServices.updateOne(accountId, { isOtpEnabled: false }, { OtpEnabledAt: 1 });

		return OTP_DISABLED_SUCCESSFULLY;
	}

	static async send(accountId) {
		return await OtpServices.#generateSaveSendOtp(accountId);
	}

	static async verify({ accountId, givenOtp }) {
		await OtpServices.#verifyDeleteOtp(accountId, givenOtp);

		return OTP_VERIFIED_SUCCESSFULLY;
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
		const isOtpFound = await OtpServices.findOne(accountId);

		if (isOtpFound) {
			throw new BadRequestException(ALREADY_HAVE_VALID_OTP);
		}

		const hashedOtp = await OtpServices.generatSendOtp(accountId);

		await OtpRepository.create({ accountId, hashedOtp });

		return OTP_SENT_SUCCESSFULLY;
	}

	static async #verifyDeleteOtp(accountId, givenOtp) {
		const foundOtp = await OtpServices.findOne(accountId);

		if (!foundOtp) {
			throw new ForbiddenException(EXPIRED_OTP);
		}

		if (foundOtp.count >= 3) {
			await OtpServices.deleteOneById(foundOtp._id);

			throw new ForbiddenException(REACHED_MAXIMUM_WRONG_TRIES);
		}

		const isOtpValid = await HashHelper.verify(givenOtp, foundOtp.hashedOtp);

		if (!isOtpValid) {
			await OtpServices.updateOne(foundOtp._id, { count: foundOtp.count + 1 });

			throw new ForbiddenException(INVALID_OTP);
		}

		await OtpServices.deleteOneById(foundOtp._id);
	}

	/* 
		=======================================
			CRUD methods 
		=======================================
	*/

	static async create(payload) {
		const isOtpCreated = await OtpRepository.create(payload);

		if (!isOtpCreated) {
			throw new InternalServerException(OTP_CREATE_FAILED);
		}

		return isOtpCreated;
	}

	static async findOne(payload) {
		const isOtpFound = await OtpRepository.findOne(payload);

		if (!isOtpFound) {
			throw new InternalServerException(OTP_READ_FAILED);
		}

		return isOtpFound;
	}

	static async updateOne(otpId, setPayload, unsetPayload) {
		const isOtpUpdated = await OtpRepository.updateOne(otpId, setPayload, unsetPayload);

		if (!isOtpUpdated) {
			throw new InternalServerException(OTP_UPDATE_FAILED);
		}

		return isOtpUpdated;
	}

	static async deleteOneById(otpId) {
		const { deletedCount } = await OtpRepository.deleteOneById(otpId);

		if (deletedCount === 0) {
			throw new InternalServerException(OTP_DELETE_FAILED);
		}
	}
}

module.exports = OtpServices;
