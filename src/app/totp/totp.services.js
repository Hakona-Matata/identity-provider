const {
	SUCCESS_MESSAGES: { TOTP_ENABLED_SUCCESSFULLY, TOTP_DISABLED_SUCCESSFULLY },
	FAILURE_MESSAGES: {
		TOTP_ALREADY_ENABLED,
		TOTP_ALREADY_DISABLED,
		TOTP_ALREADY_CONFIRMED,
		TOTP_NOT_ENABLED,
		START_FROM_SCRATCH,
		INVALID_TOTP,

		TOTP_CREATE_FAILED,
		TOTP_UPDATE_FAILED,
		TOTP_DELETE_FAILED,
		TOTP_NOT_FOUND,
	},
} = require("./totp.constants");

const {
	BadRequestException,
	InternalServerException,
	NotFoundException,
	ForbiddenException,
} = require("./../../exceptions/index");

const TotpRepository = require("./totp.repositories");
const AccountServices = require("./../account/account.services");
const SessionServices = require("../session/session.services");

const { TotpHelper } = require("../../helpers");

/**
 * A class representing services for  TOTP (Time-based One-time Password)
 * @class
 */
class TotpServices {
	/**
	 * Initiates enabling of two-factor authentication.
	 *
	 * @async
	 * @param {string} accountId - The ID of the account.
	 * @param {boolean} isTotpEnabled - Whether two-factor authentication is already enabled.
	 * @returns {Promise<{ secret: string }>} An object containing the plain text secret.
	 */
	static async initiateEnabling(accountId, isTotpEnabled) {
		if (isTotpEnabled) {
			throw new BadRequestException(TOTP_ALREADY_ENABLED);
		}

		const { plainTextTotpSecret, encryptedTotpSecret } = await TotpServices.#generateEncryptedTotpSecret();

		await TotpServices.createOne({ accountId, secret: encryptedTotpSecret });

		return { secret: plainTextTotpSecret };
	}

	/**
	 * Confirms the enabling of two-factor authentication.
	 *
	 * @async
	 * @param {string} accountId - The ID of the account.
	 * @param {string} givenTotp - The time-based one-time password given by the user.
	 * @param {boolean} isTotpEnabled - Whether two-factor authentication is already enabled.
	 * @returns {Promise<string>} A success message.
	 */
	static async confirmEnabling(accountId, givenTotp, isTotpEnabled) {
		if (isTotpEnabled) {
			throw new BadRequestException(TOTP_ALREADY_ENABLED);
		}

		const { _id: totpId, secret, isTemp, failedAttemptCount } = await TotpServices.findOne({ accountId });

		if (!isTemp) {
			throw new ForbiddenException(TOTP_ALREADY_CONFIRMED);
		}

		if (failedAttemptCount >= 3) {
			await TotpServices.deleteOne({ _id: totpId });

			throw new ForbiddenException(START_FROM_SCRATCH);
		}

		await TotpServices.#verifyTotpCode({
			totpId,
			secret,
			failedAttemptCount,
			givenTotp,
		});

		await TotpServices.updateOne({ _id: totpId }, { isTemp: false }, { failedAttemptCount: 1 });

		await AccountServices.updateOne({ _id: accountId }, { isTotpEnabled: true, totpEnabledAt: new Date() });

		return TOTP_ENABLED_SUCCESSFULLY;
	}

	/**
	 * Disables two-factor authentication.
	 *
	 * @async
	 * @param {string} accountId - The ID of the account.
	 * @param {boolean} isTotpEnabled - Whether two-factor authentication is already enabled.
	 * @returns {Promise<string>} A success message.
	 */
	static async disable(accountId, isTotpEnabled) {
		if (!isTotpEnabled) {
			throw new BadRequestException(TOTP_ALREADY_DISABLED);
		}

		await TotpServices.deleteOne({ accountId });

		await AccountServices.updateOne({ _id: accountId }, { isTotpEnabled: false }, { totpEnabledAt: 1 });

		return TOTP_DISABLED_SUCCESSFULLY;
	}

	/**
	 * Verifies the time-based one-time password for two-factor authentication.
	 *
	 * @async
	 * @param {string} accountId - The ID of the account.
	 * @param {string} givenTotp - The time-based one-time password given by the user.
	 * @returns {Promise<string>} A success message.
	 */
	static async verify(accountId, givenTotp) {
		const foundAccount = await AccountServices.findOne({ _id: accountId });
		if (!foundAccount || (foundAccount && !foundAccount.isTotpEnabled)) throw new ForbiddenException(TOTP_NOT_ENABLED);

		const totp = await TotpServices.findOne({ accountId });

		if (!totp) {
			throw new ForbiddenException(INVALID_TOTP);
		}

		await TotpServices.#verifyTotpCode({
			totpId: totp._id,
			secret: totp.secret,
			failedAttemptCount: totp.failedAttemptCount,
			givenTotp,
		});

		return await SessionServices.createOne({ accountId: foundAccount._id, role: foundAccount.role });
	}

	/**
	 * Generates an encrypted time-based one-time password secret.
	 *
	 * @async
	 * @private
	 * @returns {Promise<{ plainTextTotpSecret: string, encryptedTotpSecret: string }>} An object containing the plain text and encrypted secrets.
	 */
	static async #generateEncryptedTotpSecret() {
		const { plainTextTotpSecret, encryptedTotpSecret } = TotpHelper.generateTotpSecret();

		return { plainTextTotpSecret, encryptedTotpSecret };
	}

	/**
	 * Verifies the time-based one-time password code.
	 *
	 * @async
	 * @private
	 * @param {string} totpId - The ID of the time-based one-time password.
	 * @param {string} secret - The encrypted time-based one-time password secret.
	 * @param {number} failedAttemptCount - The number of failed attempts.
	 * @param {string} givenTotp - The time-based one-time password given by the user.
	 */
	static async #verifyTotpCode({ totpId, secret, failedAttemptCount, givenTotp }) {
		const isTotpValid = TotpHelper.verifyTotpCode(givenTotp, secret);

		if (!isTotpValid) {
			await TotpServices.updateOne({ _id: totpId }, { failedAttemptCount: failedAttemptCount + 1 });

			throw new ForbiddenException(INVALID_TOTP);
		}
	}

	/**
	 * Creates a new TOTP (Time-based One-time Password) entry in the database.
	 *
	 * @param {object} payload - The payload containing the data for the TOTP entry.
	 * @returns {Promise<boolean>} A Promise that resolves to a boolean indicating whether the TOTP entry was created successfully.
	 */
	static async createOne(payload) {
		const isTotpCreated = await TotpRepository.insertOne(payload);

		if (!isTotpCreated) {
			throw new InternalServerException(TOTP_CREATE_FAILED);
		}

		return isTotpCreated;
	}

	/**
	 * Finds a TOTP entry in the database that matches the specified payload.
	 *
	 * @param {object} payload - The payload containing the data to match against the TOTP entry.
	 * @returns {Promise<object|null>} A Promise that resolves to the matched TOTP entry or null if no match was found.
	 */
	static async findOne(payload) {
		return await TotpRepository.findOne(payload);
	}

	/**
	 * Updates a TOTP entry in the database that matches the specified filter.
	 *
	 * @param {object} filter - The filter used to find the TOTP entry to update.
	 * @param {object} setPayload - The payload containing the data to set in the TOTP entry.
	 * @param {object} unsetPayload - The payload containing the data to unset in the TOTP entry.
	 * @returns {Promise<boolean>} A Promise that resolves to a boolean indicating whether the TOTP entry was updated successfully.
	 */
	static async updateOne(filter, setPayload, unsetPayload) {
		const isTotpUpdated = await TotpRepository.updateOne(filter, setPayload, unsetPayload);

		if (!isTotpUpdated) {
			throw new InternalServerException(TOTP_UPDATE_FAILED);
		}

		return isTotpUpdated;
	}

	/**
	 * Deletes a TOTP entry from the database that matches the specified filter.
	 *
	 * @param {object} filter - The filter used to find the TOTP entry to delete.
	 * @returns {Promise<void>} A Promise that resolves when the TOTP entry has been deleted.
	 */
	static async deleteOne(filter) {
		const { deletedCount } = await TotpRepository.deleteOne(filter);

		if (deletedCount === 0) throw new InternalServerException(TOTP_DELETE_FAILED);
	}

	/**
	 *
	 * Deletes multiple TOTP entries from the database that match the specified filter.
	 * @param {object} filter - The filter used to find the TOTP entries to delete
	 * @returns {Promise<void>} A Promise that resolves when the TOTP entries have been deleted.
	 * @throws {InternalServerException} If the delete operation fails or no entries are deleted.
	 */
	static async deleteMany(filter) {
		const { deletedCount } = await TotpRepository.deleteMany(filter);

		if (deletedCount === 0) throw new InternalServerException(TOTP_DELETE_FAILED);
	}
}

module.exports = TotpServices;
