const HashHelper = require("../../helpers/hash");
const SmsRepository = require("./sms.repository");
const OtpServices = require("./../otp/otp.services");
const AccountServices = require("./../account/account.services");
const SessionServices = require("./../session/session.services");

const {
	SUCCESS_MESSAGES: {
		SMS_SENT_SUCCESSFULLY,
		SMS_ENABLED_SUCCESSFULLY,
		SMS_DISABLED_SUCCESSFULLY,
	},
	FAILURE_MESSAGES: {
		SMS_ALREADY_ENABLED,
		ALREADY_HAVE_VALID_SMS,
		EXPIRED_SMS,
		INVALID_OTP,
		ALREADY_DISABLED_SMS,
		SMS_NOT_FOUND,
		SMS_CREATE_FAILED,
		SMS_UPDATE_FAILED,
		SMS_DELETION_FAILED,
	},
} = require("./sms.constants");

const { BadRequestException, InternalServerException } = require("./../../exceptions/index");

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

		await AccountServices.updateOne({ _id: accountId }, { phone, country });

		return SMS_SENT_SUCCESSFULLY;
	}

	static async confirm(accountId, givenOtp) {
		await SmsServices.#verifyDeleteOtp(accountId, givenOtp);

		await AccountServices.updateOne(
			{ _id: accountId },
			{
				isPhoneVerified: true,
				phoneVerifiedAt: new Date(),
				isSmsEnabled: true,
				SMSEnabledAt: new Date(),
			}
		);

		return SMS_ENABLED_SUCCESSFULLY;
	}

	static async disable(accountId, isSmsEnabled) {
		if (!isSmsEnabled) {
			throw new BadRequestException(ALREADY_DISABLED_SMS);
		}

		await AccountServices.updateOne({ _id: accountId }, { isSmsEnabled: false }, { smsEnabledAt: 1 });

		return SMS_DISABLED_SUCCESSFULLY;
	}

	static async send(accountId) {
		await SmsServices.#generateSaveSendOtp(accountId);

		return SMS_SENT_SUCCESSFULLY;
	}

	static async verify({ accountId, givenOtp }) {
		await SmsServices.#verifyDeleteOtp(accountId, givenOtp);

		const account = await AccountServices.findById(accountId);

		return await SessionServices.createOne({ accountId: account._id, role: account.role });
	}

	/* 
		=======================================
			Private methods 
		=======================================
	*/

	static async #generateSaveSendOtp(accountId) {
		const isSmsFound = await SmsServices.findOne({ accountId });

		if (isSmsFound) {
			throw new BadRequestException(ALREADY_HAVE_VALID_SMS);
		}

		const hashedOtp = await OtpServices.generatSendOtp();

		return await SmsServices.createOne({ accountId, hashedOtp });
	}

	static async #verifyDeleteOtp(accountId, givenOtp) {
		const isSmsFound = await SmsServices.findOne({ accountId });

		if (!isSmsFound) {
			throw new BadRequestException(EXPIRED_SMS);
		}

		const isOtpValid = await HashHelper.verify(givenOtp, isSmsFound.hashedOtp);

		if (!isOtpValid) {
			throw new ForbiddenException(INVALID_OTP);
		}

		await SmsServices.deleteOne({ _id: isSmsFound._id });
	}

	/* 
		=======================================
			CRUD methods 
		=======================================
	*/

	static async createOne(payload) {
		const isSmsCreated = await SmsRepository.insertOne(payload);

		if (!isSmsCreated) {
			throw new InternalServerException(SMS_CREATE_FAILED);
		}

		return isSmsCreated;
	}

	static async findOne(filter) {
		return await SmsRepository.findOne(filter);

		// if (!isSmsFound) {
		// 	throw new InternalServerException(SMS_READ_FAILED);
		// }

		// return isSmsFound;
	}

	static async updateOne(filter, setPayload, unsetPayload) {
		const isSmsUpdated = await SmsRepository.updateOne(filter, setPayload, unsetPayload);

		if (!isSmsUpdated) {
			throw new InternalServerException(SMS_UPDATE_FAILED);
		}

		return isSmsUpdated;
	}

	static async deleteOne(filter) {
		const isSmsDeleted = await SmsRepository.deleteOne(filter);

		if (!isSmsDeleted) {
			throw new NotFoundException(SMS_NOT_FOUND);
		} else if (isSmsDeleted.deletedCount === 0) {
			throw new InternalServerException(SMS_DELETION_FAILED);
		}
	}
}

module.exports = SmsServices;
