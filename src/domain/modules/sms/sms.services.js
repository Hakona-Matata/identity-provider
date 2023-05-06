const {
	SUCCESS_MESSAGES: { SMS_SENT_SUCCESSFULLY, SMS_ENABLED_SUCCESSFULLY, SMS_DISABLED_SUCCESSFULLY },
	FAILURE_MESSAGES: {
		SMS_ALREADY_ENABLED,
		ALREADY_HAVE_VALID_SMS,
		REACHED_MAXIMUM_WRONG_TRIES,
		EXPIRED_SMS,
		INVALID_OTP,
		CANNOT_VERIFY,
		ALREADY_DISABLED_SMS,
		SMS_CREATE_FAILED,
		SMS_UPDATE_FAILED,
		SMS_DELETION_FAILED,
	},
} = require("./sms.constants");

const { ForbiddenException, InternalServerException, BadRequestException } = require("./../../../shared/exceptions");

const OtpServices = require("./../otp/otp.services");
const AccountServices = require("./../account/account.services");
const SessionServices = require("./../session/session.services");
const SmsRepository = require("./sms.repository");

const { HashHelper } = require("../../../shared/helpers");

/**
 * A class representing the SMS services of the application.
 *
 * @class
 */
class SmsServices {
	/**
	 * Enables SMS verification for the given account.
	 *
	 * @static
	 * @async
	 * @param {object} options - The options for enabling SMS verification.
	 * @param {string} options.accountId - The ID of the account to enable SMS verification for.
	 * @param {boolean} options.isSmsEnabled - Indicates whether SMS verification is already enabled for the account.
	 * @param {string} options.phone - The phone number to enable SMS verification for.
	 * @param {string} options.country - The country code of the phone number to enable SMS verification for.
	 * @returns {Promise<string>} - A success message indicating that an OTP has been sent to the user's phone.
	 * @throws {BadRequestException} - If SMS verification is already enabled for the account.
	 */
	static async enable({ accountId, isSmsEnabled, phone, country }) {
		if (isSmsEnabled) {
			throw new BadRequestException(SMS_ALREADY_ENABLED);
		}

		await SmsServices.#generateSaveSendOtp(accountId);

		await AccountServices.updateOne({ _id: accountId }, { phone, country });

		return SMS_SENT_SUCCESSFULLY;
	}

	/**
	 * Confirms SMS verification for the given account using the provided OTP.
	 * @static
	 * @async
	 * @param {string} accountId - The ID of the account to confirm SMS verification for.
	 * @param {string} givenOtp - The OTP provided by the user to confirm SMS verification.
	 * @returns {Promise<string>} - A success message indicating that SMS verification has been enabled for the user's account.
	 * @throws {NotFoundException} - If an SMS verification record is not found for the given account.
	 * @throws {BadRequestException} - If SMS verification is already disabled for the account.
	 * @throws {ForbiddenException} - If the provided OTP is invalid.
	 */
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

	/**
	 * Disables SMS verification for the given account.
	 *
	 * @static
	 * @async
	 * @param {string} accountId - The ID of the account to disable SMS verification for.
	 * @param {boolean} isSmsEnabled - Indicates whether SMS verification is currently enabled for the account.
	 * @returns {Promise<string>} - A success message indicating that SMS verification has been disabled for the user's account.
	 * @throws {BadRequestException} - If SMS verification is already disabled for the account.
	 */
	static async disable(accountId, isSmsEnabled) {
		if (!isSmsEnabled) {
			throw new BadRequestException(ALREADY_DISABLED_SMS);
		}

		await AccountServices.updateOne({ _id: accountId }, { isSmsEnabled: false }, { smsEnabledAt: 1 });

		return SMS_DISABLED_SUCCESSFULLY;
	}

	/**
	 * Sends an OTP to the user's phone for SMS verification.
	 * @static
	 * @async
	 * @param {string} accountId - The ID of the account to send the OTP to.
	 * @returns {Promise<string>} - A success message indicating that an OTP has been sent to the user's phone.
	 * @throws {BadRequestException} - If an SMS verification record already exists for the given account.
	 */
	static async send(accountId) {
		await SmsServices.#generateSaveSendOtp(accountId);

		return SMS_SENT_SUCCESSFULLY;
	}

	/**
	 * Verifies the provided OTP for the given account and creates a new session for the user.
	 * @static
	 * @async
	 * @param {object} options - The options for verifying the OTP and creating a new session.
	 * @param {string} options.accountId - The ID of the account to verify the OTP for and create a new session for.
	 * @param {string} options.givenOtp - The OTP provided by the user to verify SMS verification.
	 * @returns {Promise<object>} - The newly created session object.
	 * @throws {NotFoundException} - If an SMS verification record is not found for the given account.
	 * @throws {ForbiddenException} - If the provided OTP is invalid.
	 */
	static async verify({ accountId, givenOtp }) {
		const account = await AccountServices.findById(accountId);

		if (!account || !account.isSmsEnabled) throw new ForbiddenException(CANNOT_VERIFY);

		await SmsServices.#verifyDeleteOtp(accountId, givenOtp);

		return await SessionServices.createOne({ accountId: account._id, role: account.role });
	}

	/**
	 * Generates and saves a hashed OTP for the given accountId and returns the newly created SMS object.
	 * @async
	 * @private
	 * @param {string} accountId - The ID of the account for which to generate and save the OTP.
	 * @throws {BadRequestException} If there is already a valid SMS object for the given account.
	 * @returns {Promise<Object>} The newly created SMS object.
	 */
	static async #generateSaveSendOtp(accountId) {
		const isSmsFound = await SmsServices.findOne({ accountId });

		if (isSmsFound) {
			throw new ForbiddenException(ALREADY_HAVE_VALID_SMS);
		}

		const hashedOtp = await OtpServices.generateSendOtp();

		return await SmsServices.createOne({ accountId, hashedOtp });
	}

	/**
	 * Verifies the given OTP for the given accountId and deletes the corresponding SMS object if the OTP is valid.
	 * @async
	 * @private
	 * @param {string} accountId - The ID of the account for which to verify the OTP and delete the corresponding SMS object.
	 * @param {string} givenOtp - The OTP provided by the user to be verified.
	 * @throws {BadRequestException} If there is no SMS object found for the given account.
	 * @throws {ForbiddenException} If the given OTP is not valid.
	 * @returns {Promise<void>}
	 */
	static async #verifyDeleteOtp(accountId, givenOtp) {
		const isSmsFound = await SmsServices.findOne({ accountId });

		if (!isSmsFound) {
			throw new ForbiddenException(EXPIRED_SMS);
		}

		if (isSmsFound.failedAttemptCount >= 3) {
			await SmsServices.deleteOne({ _id: isSmsFound._id });

			throw new ForbiddenException(REACHED_MAXIMUM_WRONG_TRIES);
		}

		const isOtpValid = await HashHelper.verify(givenOtp, isSmsFound.hashedOtp);

		if (!isOtpValid) {
			await SmsServices.updateOne({ _id: isSmsFound._id }, { failedAttemptCount: isSmsFound.failedAttemptCount + 1 });

			throw new ForbiddenException(INVALID_OTP);
		}

		await SmsServices.deleteOne({ _id: isSmsFound._id });
	}

	/**
	 * Creates an Sms document.
	 *
	 * @param {Object} payload - The data to create an Sms document.
	 * @returns {Promise<Object>} The newly created Sms document.
	 * @throws {InternalServerException} If the Sms document creation fails.
	 */
	static async createOne(payload) {
		const isSmsCreated = await SmsRepository.insertOne(payload);

		if (!isSmsCreated) {
			throw new InternalServerException(SMS_CREATE_FAILED);
		}

		return isSmsCreated;
	}

	/**
	 * Finds an Sms document based on the given filter.
	 *
	 * @param {Object} filter - The filter to find the Sms document.
	 * @returns {Promise<Object>} The Sms document that matches the filter.
	 * @throws {InternalServerException} If the Sms document retrieval fails.
	 */
	static async findOne(filter) {
		return await SmsRepository.findOne(filter);
	}

	/**
	 * Updates an Sms document based on the given filter.
	 *
	 * @param {Object} filter - The filter to find the Sms document to update.
	 * @param {Object} setPayload - The data to update in the Sms document.
	 * @param {Object} unsetPayload - The data to unset in the Sms document.
	 * @returns {Promise<Object>} The updated Sms document.
	 * @throws {InternalServerException} If the Sms document update fails.
	 */
	static async updateOne(filter, setPayload, unsetPayload) {
		const isSmsUpdated = await SmsRepository.updateOne(filter, setPayload, unsetPayload);

		if (!isSmsUpdated) {
			throw new InternalServerException(SMS_UPDATE_FAILED);
		}

		return isSmsUpdated;
	}

	/**
	 * Deletes an Sms document based on the given filter.
	 *
	 * @param {Object} filter - The filter to find the Sms document to delete.
	 * @returns {Promise<Object>} The deleted Sms document.
	 * @throws {NotFoundException} If the Sms document is not found.
	 * @throws {InternalServerException} If the Sms document deletion fails.
	 */
	static async deleteOne(filter) {
		const { deletedCount } = await SmsRepository.deleteOne(filter);

		if (deletedCount === 0) throw new InternalServerException(SMS_DELETION_FAILED);
	}
}

module.exports = SmsServices;
