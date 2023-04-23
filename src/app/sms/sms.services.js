const HashHelper = require("../../helpers/hash");
const SmsRepository = require("./sms.repository");
const OtpServices = require("./../otp/otp.services");
const AccountServices = require("./../account/account.services");

const {
	SUCCESS_MESSAGES: {
		SMS_SENT_SUCCESSFULLY,
		SMS_ENABLED_SUCCESSFULLY,
		SMS_DISABLED_SUCCESSFULLY,
		SMS_VERIFIED_SUCCESSFULLY,
	},
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

const { BadRequestException, InternalServerException } = require("./../../Exceptions/index");

class SmsServices {
	/* 
		=======================================
			Public methods 
		=======================================
	*/
	static async enable({ accountId, isSmsEnabled, phone, country }) {
		if (isSmsEnabled) {
			throw new BadRequestException(SMS_ALREADY_ENABLED);
		}

		await SmsServices.#generateSaveSendOtp(accountId);

		await AccountServices.updateOne(accountId, { phone, country });

		return SMS_SENT_SUCCESSFULLY;
	}

	static async confirm({ accountId, givenOtp }) {
		await SmsServices.#verifyDeleteOtp(accountId, givenOtp);

		await AccountServices.updateOne(accountId, {
			isPhoneVerified: true,
			phoneVerifiedAt: new Date(),
			isSmsEnabled: true,
			SMSEnabledAt: new Date(),
		});

		return SMS_ENABLED_SUCCESSFULLY;
	}

	static async disable({ accountId, isSmsEnabled }) {
		if (!isSmsEnabled) {
			throw new BadRequestException(ALREADY_DISABLED_SMS);
		}

		await AccountServices.updateOne(accountId, { isSmsEnabled: false }, { smsEnabledAt: 1 });

		return SMS_DISABLED_SUCCESSFULLY;
	}

	static async send(accountId) {
		return await SmsServices.#generateSaveSendOtp(accountId);
	}

	static async verify({ accountId, givenOtp }) {
		await SmsServices.#verifyDeleteOtp(accountId, givenOtp);

		return SMS_VERIFIED_SUCCESSFULLY;
	}

	/* 
		=======================================
			Private methods 
		=======================================
	*/

	static async #generateSaveSendOtp(accountId) {
		const isSmsFound = await SmsServices.findOneById(accountId);

		if (isSmsFound) {
			throw new BadRequestException(ALREADY_HAVE_VALID_SMS);
		}

		const hashedOtp = await OtpServices.generateSendOtp();

		await SmsServices.create({ accountId, hashedOtp });
	}

	static async #verifyDeleteOtp(accountId, givenOtp) {
		const isSmsFound = await SmsServices.findOneById(accountId);

		if (!isSmsFound) {
			throw new BadRequestException(EXPIRED_SMS);
		}

		const isOtpValid = await HashHelper.verify(givenOtp, isSmsFound.hashedOtp);

		if (!isOtpValid) {
			throw new ForbiddenException(INVALID_OTP);
		}

		await SmsServices.deleteOne(isSmsFound._id);
	}

	/* 
		=======================================
			CRUD methods 
		=======================================
	*/

	static async insertOne(payload) {
		const isSmsCreated = await SmsRepository.create(payload);

		if (!isSmsCreated) {
			throw new InternalServerException(SMS_CREATE_FAILED);
		}

		return isSmsCreated;
	}

	static async findOneById(smsId) {
		const isSmsFound = await SmsRepository.findOne({ _id: smsId });

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
