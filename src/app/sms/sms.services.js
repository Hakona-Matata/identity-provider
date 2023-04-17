const {
	SUCCESS_MESSAGES: { SMS_SENT_SUCCESSFULLY, SMS_ENABLED_SUCCESSFULLY, SMS_DISABLED_SUCCESSFULLY },
	FAILURE_MESSAGES: {
		SMS_ALREADY_ENABLED,
		ALREADY_HAVE_VALID_SMS,
		EXPIRED_SMS,
		INVALID_OTP,
		ALREADY_DISABLED_SMS,

		SMS_CREATE_FAILED,
		SMS_READ_FAILED,
		SMS_UPDATE_FAILED,
		SMS_DELETE_FAILED,
	},
} = require("./sms.constants");

const SmsRepository = require("./sms.repository");
const OtpServices = require("./../otp/otp.services");
const AccountRepository = require("./../account/account.repositories");
const AccountServices = require("./../account/account.services");

const BadRequestException = require("./../../Exceptions/common/badRequest.exception");
const HashHelper = require("../../helpers/hash");
const InternalServerException = require("../../Exceptions/common/internalServer.exception");

class SmsServices {
	static async enable({ accountId, isSmsEnabled, phone, country }) {
		SmsServices.#isSmsEnabled(isSmsEnabled);

		const isSmsFound = await SmsRepository.findOne({ accountId });

		if (isSmsFound) {
			throw new BadRequestException(ALREADY_HAVE_VALID_SMS);
		}

		const hashedOtp = await OtpServices.generateHashedOtp();

		await SmsRepository.create({ accountId, hashedOtp });

		await AccountRepository.updateOne(accountId, { phone, country });

		return SMS_SENT_SUCCESSFULLY;
	}

	static async confirm({ accountId, givenOtp }) {
		const { _id: smsId } = await SmsServices.#verifyOtp(accountId, givenOtp);

		await SmsServices.deleteOne(smsId);

		await AccountServices.updateOne(accountId, {
			isPhoneVerified: true,
			phoneVerifiedAt: new Date(),
			isSmsEnabled: true,
			SMSEnabledAt: new Date(),
		});

		return SMS_ENABLED_SUCCESSFULLY;
	}

	static async disable({ accountId, isSmsEnabled }) {
		SmsServices.#isSmsDisabled(isSmsEnabled);

		await AccountServices.updateOne(accountId, { isSmsEnabled: false }, { SmsEnabledAt: 1 });

		return SMS_DISABLED_SUCCESSFULLY;
	}

	static #isSmsEnabled(isSmsEnabled) {
		if (isSmsEnabled) {
			throw new BadRequestException(SMS_ALREADY_ENABLED);
		}
	}

	static #isSmsDisabled(isSmsEnabled) {
		if (!isSmsEnabled) {
			throw new BadRequestException(ALREADY_DISABLED_SMS);
		}
	}

	static async #verifyOtp(accountId, givenOtp) {
		const isSmsFound = await SmsRepository.findOne({ accountId });

		if (!isSmsFound) {
			throw new BadRequestException(EXPIRED_SMS);
		}

		const isOtpValid = await HashHelper.verify(givenOtp, isSmsFound.hashedOtp);

		if (!isOtpValid) {
			throw new ForbiddenException(INVALID_OTP);
		}

		return isSmsFound;
	}

	//-------------------------------------------------------------
	//-------------------------------------------------------------
	//-------------------------------------------------------------
	//-------------------------------------------------------------
	static async create(payload) {
		const isSmsCreated = await SmsRepository.create(payload);

		if (!isSmsCreated) {
			throw new InternalServerException(SMS_CREATE_FAILED);
		}

		return isSmsCreated;
	}

	static async findOne(payload) {
		const isSmsFound = await SmsRepository.findOne(payload);

		if (!isSmsFound) {
			throw new InternalServerException(SMS_READ_FAILED);
		}

		return isSmsFound;
	}

	static async updateOne(smsId, setPayload, unsetPayload) {
		const isSmsUpdated = await SmsRepository.updateOne(smsId, setPayload, unsetPayload);

		if (!isSmsUpdated) {
			throw new InternalServerException(SMS_UPDATE_FAILED);
		}

		return isSmsUpdated;
	}

	static async deleteOne(smsId) {
		const { deletedCount } = await SmsRepository.deleteOne(smsId);

		if (deletedCount === 0) {
			throw new InternalServerException(SMS_DELETE_FAILED);
		}
	}
}

module.exports = SmsServices;
