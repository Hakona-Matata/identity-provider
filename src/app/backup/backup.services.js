const AccountServices = require("../account/account.services");
const PasswordServices = require("./../password/password.services");
const AuthServices = require("./../auth/auth.services");
const BackupRepository = require("./backup.repository");

const RandomHelper = require("../../helpers/randomGenerator");
const HashHelper = require("../../helpers/hashHelper");

const {
	SUCCESS_MESSAGES: { BACKUP_ENABLED_SUCCESSFULLY, BACKUP_DISABLED_SUCCESSFULLY },
	FAILURE_MESSAGES: {
		BACKUP_ALREADY_ENABLED,
		BACKUP_ALREADY_DISABLED,
		BACKUP_CANNOT_ENABLED,
		BACKUP_ALREADY_GENERATED,
		BACKUP_NOT_GENERATED,
		INVALID_BACKUP_httpStatusCodeNumbers,
		NEED_TO_HAVE_GENERATED_httpStatusCodeNumbersS,

		BACKUP_CREATE_FAILED,
		BACKUP_UPDATE_FAILED,
		BACKUP_DELETE_FAILED,
	},
} = require("./backup.constants");

const {
	BadRequestException,
	UnAuthorizedException,
	InternalServerException,
	ForbiddenException,
} = require("./../../exceptions/index");

/**
 * A class representing backup services.
 *
 * @class
 */
class BackupServices {
	/**
	 * Initiates enabling of backup codes for the given account.
	 *
	 * @param {Object} account - The account to enable backup codes for.
	 * @returns {Object} An object containing the generated backup codes.
	 */
	static async initiateEnabling(account) {
		BackupServices.#isBackupAlreadyEnabled(account.isBackupEnabled);

		const enabledSecurityMethods = await AuthServices.getEnabledSecurityLayers(account);

		if (enabledSecurityMethods.length == 0) {
			throw new ForbiddenException(BACKUP_CANNOT_ENABLED);
		}

		const foundBackupCodes = await BackupServices.findMany({ accountId: account._id });

		if (foundBackupCodes.length >= 1) {
			throw new ForbiddenException(BACKUP_ALREADY_GENERATED);
		}

		return await BackupServices.#generateHashSaveBackupCodesList(account._id, 10);
	}

	/**
	 *
	 * Confirms enabling of backup codes for the given account with the given code.
	 * @param {Object} account - The account to confirm backup codes for.
	 * @param {string} code - The backup code to confirm.
	 * @returns {string} A success message.
	 */
	static async confirmEnabling(account, code) {
		BackupServices.#isBackupAlreadyEnabled(account.isBackupEnabled);

		await BackupServices.#verifyDeleteBackupCode(account._id, code);

		await BackupServices.updateMany({ accountId: account._id }, { isTemp: false });

		await AccountServices.updateOne({ _id: account._id }, { isBackupEnabled: true, backupEnabledAt: new Date() });

		return BACKUP_ENABLED_SUCCESSFULLY;
	}

	/**
	 * Disables backup codes for the given account.
	 *
	 * @param {Object} account - The account to disable backup codes for.
	 * @returns {string} A success message.
	 */
	static async disable(account) {
		if (!account.isBackupEnabled) {
			throw new BadRequestException(BACKUP_ALREADY_DISABLED);
		}

		await BackupServices.deleteMany({ account: account._id });

		await AccountServices.updateOne({ _id: account._id }, { isBackupEnabled: false }, { backupEnabledAt: 1 });

		return BACKUP_DISABLED_SUCCESSFULLY;
	}

	/**
	 * Regenerates backup codes for the given account.
	 *
	 * @param {string} accountId - The ID of the account to regenerate backup codes for.
	 * @returns {Object} An object containing the regenerated backup codes.
	 */
	static async regenerate(accountId) {
		const accountHashedBackupCodesList = await BackupServices.findMany({ accountId });

		if (accountHashedBackupCodesList.length === 0) {
			throw new UnAuthorizedException(NEED_TO_HAVE_GENERATED_httpStatusCodeNumbersS);
		}

		await BackupServices.deleteMany({ accountId });

		await AccountServices.updateOne({ _id: accountId }, { isBackupEnabled: false }, { backupEnabledAt: 1 });

		return await BackupServices.#generateHashSaveBackupCodesList(accountId, 10);
	}

	/**
	 * Verifies the given backup code for the given email address.
	 *
	 * @param {Object} params - The parameters for verification.
	 * @param {string} params.email - The email address of the account to verify backup code for.
	 * @param {string} params.code - The backup code to verify.
	 * @returns {string} A success message.
	 */
	static async verify({ email, code }) {
		const account = await AccountServices.findOne({ email });

		// TODO handle if condition from account services!
		if (!account || !account.isBackupEnabled) {
			throw new UnAuthorizedException(INVALID_BACKUP_httpStatusCodeNumbers);
		}

		await BackupServices.#verifyDeleteBackupCode(account._id, code);

		return await PasswordServices.forget(email);
	}

	/**
	 * Checks if backup is already enabled for the account.
	 *
	 * @param {boolean} isBackupEnabled - A boolean value indicating if backup is already enabled.
	 * @throws {BadRequestException} If backup is already enabled.
	 * @returns {void}
	 */
	static #isBackupAlreadyEnabled(isBackupEnabled) {
		if (isBackupEnabled) {
			throw new ForbiddenException(BACKUP_ALREADY_ENABLED);
		}
	}

	/**
	 * Generates a list of backup codes for the account.
	 *
	 * @async
	 * @param {string} accountId - The ID of the account.
	 * @param {number} listLength - The length of the backup codes list.
	 * @returns {Promise<Array>} The list of backup codes.
	 */
	static async #generateBackupCodesList(accountId, listLength) {
		const codesList = [];

		for (let i = 0; i < listLength; i++) {
			const backupCodeObject = { accountId, code: RandomHelper.generateRandomString(16) };

			codesList.push(backupCodeObject);
		}

		return codesList;
	}

	/**
	 * Hashes the backup codes list for the account.
	 *
	 * @async
	 * @param {Array} backupCodesList - The list of backup codes.
	 * @returns {Promise<Array>} The hashed backup codes list.
	 */
	static async #hashBackupCodesList(backupCodesList) {
		const hashedList = [];

		for (let i = 0; i < backupCodesList.length; i++) {
			const backupCodeObject = {
				accountId: backupCodesList[i].accountId,
				code: await HashHelper.generate(backupCodesList[i].code),
			};

			hashedList.push(backupCodeObject);
		}

		return hashedList;
	}

	/**
	 *
	 * Generates and saves a list of hashed backup codes for the account.
	 *
	 * @async
	 * @param {string} accountId - The ID of the account.
	 * @param {number} backupCodesListLength - The length of the backup codes list.
	 * @returns {Promise<Object>} An object containing the generated backup codes.
	 */
	static async #generateHashSaveBackupCodesList(accountId, backupCodesListLength) {
		const generatedBackupCodesList = await BackupServices.#generateBackupCodesList(accountId, backupCodesListLength);

		const hashedBackupCodesList = await BackupServices.#hashBackupCodesList(generatedBackupCodesList);

		await BackupServices.createMany(hashedBackupCodesList);

		return {
			codes: generatedBackupCodesList.map((el) => el.code),
		};
	}

	/**
	 *Verifies if the given backup code is valid for the account.
	 *
	 * @async
	 * @param {string} accountId - The ID of the account.
	 * @param {string} givenBackupCode - The backup code to be verified.
	 * @returns {Promise<Object>} An object containing the matched backup code ID and code.
	 */
	static async #verifyBackupCode(accountId, givenBackupCode) {
		const accountHashedBackupCodesList = await BackupServices.findMany({ accountId });

		if (accountHashedBackupCodesList.length === 0) {
			throw new BadRequestException(BACKUP_NOT_GENERATED);
		}

		const matchedBackupCode = accountHashedBackupCodesList
			.filter(async (accountHashedBackupCode) => await HashHelper.verify(givenBackupCode, accountHashedBackupCode.code))
			.map(({ _id, code }) => ({ _id, code }))
			.shift();

		if (!matchedBackupCode) {
			throw new UnAuthorizedException(INVALID_BACKUP_httpStatusCodeNumbers);
		}

		return matchedBackupCode;
	}

	/**
	 *Verifies and deletes the given backup code for the account.
	 *
	 *@async
	 *@param {string} accountId - The ID of the account.
	 *@param {string} givenBackupCode - The backup code to be deleted.
	 *@returns {Promise<Object>} An object indicating the success of the deletion.
	 */
	static async #verifyDeleteBackupCode(accountId, givenBackupCode) {
		const { code } = await BackupServices.#verifyBackupCode(accountId, givenBackupCode);

		return await BackupServices.deleteOne({ accountId, code });
	}

	/**
	 *Creates multiple backup codes in the database.
	 *
	 *@param {Object[]} payload - The payload containing the accountId and backup codes.
	 *@returns {Promise<boolean>} A Promise that resolves to a boolean indicating if the backup codes were successfully created.
	 *@throws {InternalServerException} If the backup codes could not be created.
	 */
	static async createMany(payload) {
		const areBackupCodesCreated = await BackupRepository.insertMany(payload);

		if (!areBackupCodesCreated) {
			throw new InternalServerException(BACKUP_CREATE_FAILED);
		}

		return areBackupCodesCreated;
	}

	/**
	 *Finds a single backup code in the database based on the provided filter.
	 *
	 *@param {Object} filter - The filter object to search for the backup code.
	 *@returns {Promise<Object|null>} A Promise that resolves to the backup code object or null if not found.
	 */
	static async findOne(filter) {
		return await BackupRepository.findOne(filter);
	}

	/**
	 *Finds multiple backup codes in the database based on the provided filter.
	 *
	 *@param {Object} filter - The filter object to search for backup codes.
	 *@returns {Promise<Object[]>} A Promise that resolves to an array of backup code objects.
	 */
	static async findMany(filter) {
		return await BackupRepository.findMany(filter);
	}

	/**
	 *Updates multiple backup codes in the database based on the provided filter and update payloads.
	 *
	 *@param {Object} filter - The filter object to select the backup codes to update.
	 *@param {Object} setPayload - The payload to set values for update.
	 *@param {Object} unsetPayload - The payload to unset values for update.
	 *@returns {Promise<void>} A Promise that resolves when the backup codes are updated.
	 *@throws {InternalServerException} If the backup codes could not be updated.
	 */
	static async updateMany(filter, setPayload, unsetPayload) {
		const { modifiedCount } = await BackupRepository.updateMany(filter, setPayload, unsetPayload);

		if (modifiedCount === 0) {
			throw new InternalServerException(BACKUP_UPDATE_FAILED);
		}
	}

	/**
	 *
	 *Deletes a single backup code in the database based on the provided filter.
	 *
	 *@param {Object} filter - The filter object to select the backup code to delete.
	 *@returns {Promise<void>} A Promise that resolves when the backup code is deleted.
	 *@throws {InternalServerException} If the backup code could not be deleted.
	 */
	static async deleteOne(filter) {
		const { deletedCount } = await BackupRepository.deleteOne(filter);

		if (deletedCount === 0) {
			throw new InternalServerException(BACKUP_DELETE_FAILED);
		}
	}

	/**
	 * Deletes multiple backup codes in the database based on the provided filter.
	 *
	 * @param {Object} filter - The filter object to select the backup codes to delete.
	 * @returns {Promise<void>} A Promise that resolves when the backup codes are deleted.
	 * @throws {InternalServerException} If the backup codes could not be deleted.
	 */
	static async deleteMany(filter) {
		const { deletedCount } = await BackupRepository.deleteMany(filter);

		if (deletedCount === 0) {
			throw new InternalServerException(BACKUP_DELETE_FAILED);
		}
	}
}

module.exports = BackupServices;
