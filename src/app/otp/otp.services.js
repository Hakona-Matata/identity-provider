const HashHelper = require("../../helpers/hashHelper");
const RandomHelper = require("../../helpers/randomGenerator");

const AccountServices = require("./../account/account.services");
const SessionServices = require("./../session/session.services");
const OtpRepository = require("./otp.repository");

const {
	SUCCESS_MESSAGES: { OTP_SENT_SUCCESSFULLY, OTP_CONFIRMED_SUCCESSFULLY, OTP_DISABLED_SUCCESSFULLY },
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
} = require("./../../exceptions/index");

/**
 * Service class for managing OTPs (one-time passwords) for user authentication.
 *
 * @class
 */
class OtpServices {
	/**
	 * Enable OTP for an account.
	 *
	 * @param {string} accountId - The ID of the account to enable OTP for.
	 * @param {boolean} isOtpEnabled - Whether OTP is already enabled for the account.
	 * @returns {Promise<string>} A message indicating that OTP has been sent successfully.
	 */
	static async enable(accountId, isOtpEnabled) {
		if (isOtpEnabled) {
			throw new BadRequestException(OTP_ALREADY_ENABLED);
		}

		return await OtpServices.#generateSaveSendOtp(accountId);
	}

	/**
	 * Confirm OTP for an account and enable OTP for the account.
	 *
	 * @param {string} accountId - The ID of the account to confirm OTP for.
	 * @param {string} givenOtp - The OTP provided by the user.
	 * @returns {Promise<string>} A message indicating that OTP has been confirmed successfully.
	 */
	static async confirm(accountId, givenOtp) {
		const account = await AccountServices.findById(accountId);

		if (account.isOtpEnabled) {
			throw new BadRequestException(OTP_ALREADY_ENABLED);
		}

		await OtpServices.#verifyDeleteOtp(accountId, givenOtp);

		await AccountServices.updateOne({ _id: accountId }, { isOtpEnabled: true, otpEnabledAt: new Date() });

		return OTP_CONFIRMED_SUCCESSFULLY;
	}

	/**
	 * Disable OTP for an account.
	 *
	 * @param {string} accountId - The ID of the account to disable OTP for.
	 * @param {boolean} isOtpEnabled - Whether OTP is already enabled for the account.
	 * @returns {Promise<string>} A message indicating that OTP has been disabled successfully.
	 */
	static async disable(accountId, isOtpEnabled) {
		if (!isOtpEnabled) {
			throw new BadRequestException(OTP_ALREADY_DISABLED);
		}

		await AccountServices.updateOne({ _id: accountId }, { isOtpEnabled: false }, { OtpEnabledAt: 1 });

		return OTP_DISABLED_SUCCESSFULLY;
	}

	/**
	 * Send OTP to an account.
	 *
	 * @param {string} accountId - The ID of the account to send OTP to.
	 * @returns {Promise<string>} A message indicating that OTP has been sent successfully.
	 */
	static async send(accountId) {
		return await OtpServices.#generateSaveSendOtp(accountId);
	}

	/**
	 * Verify OTP for an account and create a new session for the account.
	 * @param {string} accountId - The ID of the account to verify OTP for.
	 * @param {string} givenOtp - The OTP provided by the user.
	 * @returns {Promise<object>} An object representing the new session.
	 */
	static async verify(accountId, givenOtp) {
		await OtpServices.#verifyDeleteOtp(accountId, givenOtp);

		const account = await AccountServices.findById(accountId);

		return await SessionServices.createOne({ accountId: account._id, role: account.role });
	}

	/**
	 * Generate a new OTP, save it, and send it via email.
	 * @returns {Promise<string>} The hashed OTP.
	 */
	static async generateSendOtp() {
		const plainTextOtp = RandomHelper.generateRandomNumber(6);

		const hashedOtp = await HashHelper.generate(plainTextOtp);

		// TODO: Send email
		console.log({ plainTextOtp, hashedOtp });

		return hashedOtp;
	}

	/**
	 * Generates and saves OTP for given account ID
	 *
	 * @private
	 * @static
	 * @async
	 * @param {string} accountId - The ID of the account
	 * @returns {Promise<string>} - The message indicating OTP has been sent successfully
	 * @throws {BadRequestException} - If a valid OTP already exists for the given account ID
	 */
	static async #generateSaveSendOtp(accountId) {
		const isOtpFound = await OtpServices.findOne({ accountId });

		if (isOtpFound) {
			throw new BadRequestException(ALREADY_HAVE_VALID_OTP);
		}

		const hashedOtp = await OtpServices.generateSendOtp(accountId);

		await OtpServices.createOne({ accountId, hashedOtp });

		return OTP_SENT_SUCCESSFULLY;
	}

	/**
	 * Verifies and deletes the OTP for the given account ID.
	 *
	 * @async
	 * @private
	 * @param {string} accountId - The ID of the account associated with the OTP.
	 * @param {string} givenOtp - The OTP provided by the user for verification.
	 * @throws {ForbiddenException} If the OTP is not found or has expired, or the maximum wrong tries have been exceeded, or the OTP is invalid.
	 * @returns {Promise<void>} Resolves when the OTP is successfully verified and deleted.
	 */
	static async #verifyDeleteOtp(accountId, givenOtp) {
		const foundOtp = await OtpServices.findOne({ accountId });

		if (!foundOtp) {
			throw new ForbiddenException(EXPIRED_OTP);
		}

		if (foundOtp.failedAttemptCount >= 3) {
			await OtpServices.deleteOne({ _id: foundOtp._id });

			throw new ForbiddenException(REACHED_MAXIMUM_WRONG_TRIES);
		}

		const isOtpValid = await HashHelper.verify(givenOtp, foundOtp.hashedOtp);

		if (!isOtpValid) {
			await OtpServices.updateOne({ _id: foundOtp._id }, { failedAttemptCount: foundOtp.failedAttemptCount + 1 });

			throw new ForbiddenException(INVALID_OTP);
		}

		return OtpServices.deleteOne({ _id: foundOtp._id });
	}

	/* 
		=======================================
			CRUD methods 
		=======================================
	*/

	/**
	 * Creates an OTP in the database with the provided payload.
	 *
	 * @param {Object} payload - The object containing the data needed to create an OTP.
	 * @returns {Promise<Boolean>} - Returns a boolean indicating if the OTP was created successfully or not.
	 * @throws {InternalServerException} - Throws an error if the OTP creation fails.
	 */
	static async createOne(payload) {
		const isOtpCreated = await OtpRepository.insertOne(payload);

		if (!isOtpCreated) {
			throw new InternalServerException(OTP_CREATION_FAILED);
		}

		return isOtpCreated;
	}

	/**
	 * Finds an OTP in the database based on the provided payload.
	 *
	 * @param {Object} payload - The object containing the data needed to find the OTP.
	 * @returns {Promise<Object>} - Returns a promise that resolves to an object representing the OTP if found, null otherwise.
	 */
	static async findOne(payload) {
		return await OtpRepository.findOne(payload);
	}

	/**
	 * Updates an OTP in the database based on the provided filter and payloads.
	 *
	 * @param {Object} filter - The object containing the filter used to select the OTP to be updated.
	 * @param {Object} setPayload - The object containing the data to be set in the OTP.
	 * @param {Object} unsetPayload - The object containing the data to be unset in the OTP.
	 * @returns {Promise<Object>} - Returns a promise that resolves to an object representing the updated OTP.
	 */
	static async updateOne(filter, setPayload, unsetPayload) {
		return await OtpRepository.updateOne(filter, setPayload, unsetPayload);
	}

	/**
	 * Deletes an OTP in the database based on the provided filter.
	 *
	 * @param {Object} filter - The object containing the filter used to select the OTP to be deleted.
	 * @returns {Promise<Boolean>} - Returns a boolean indicating if the OTP was deleted successfully or not.
	 */
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
