const {
	SUCCESS_MESSAGES: { BACKUP_ENABLED_SUCCESSFULLY, BACKUP_DISABLED_SUCCESSFULLY },
	FAILURE_MESSAGES: {
		BACKUP_ALREADY_ENABLED,
		BAKCUP_ALREADY_DISABLED,
		BACKUP_CANNOT_ENABLED,
		BACKUP_ALREADY_GENERATED,
		BACKUP_NOT_GENERATED,
		INVALID_BACKUP_CODE,

		BACKUP_CREATE_FAILED,
		BACKUP_READ_FAILED,
		BACKUP_UPDATE_FAILED,
		BACKUP_DELETE_FAILED,
	},
} = require("./backup.constants");

const BadRequestException = require("../../Exceptions/common/badRequest.exception");
const InternalServerException = require("../../Exceptions/common/internalServer.exception");

const AccountServices = require("../account/account.services");
const AuthServices = require("./../auth/auth.services");
const BackupRepository = require("./backup.repository");

const RandomHelper = require("./../../helpers/random");
const HashHelper = require("./../../helpers/hash");
const unAuthorizedException = require("../../Exceptions/common/unAuthorized.exception");

class BackupServices {
	/* 
		=======================================
			Public methods 
		=======================================
	*/

	static async intiateEnabling(account) {
		BackupServices.#isBackupAlreadyEnabled(account.isBackupEnabled);

		const enabledSecurityMethods = await AuthServices.getEnabledSecurityLayers(account);

		if (enabledSecurityMethods.length == 0) {
			throw new BadRequestException(BACKUP_CANNOT_ENABLED);
		}

		const foundBackupCodes = await BackupServices.find({ accountId: account._id });

		if (foundBackupCodes.length >= 1) {
			throw new BadRequestException(BACKUP_ALREADY_GENERATED);
		}

		return await BackupServices.#generateHashSaveBackupCodesList(account._id, 10);
	}

	static async confirmEnabling({ account, code }) {
		BackupServices.#isBackupAlreadyEnabled(account.isBackupEnabled);

		await BackupServices.#verifyDeleteBackupCode(account._id, code);

		await BackupServices.update({ accountId: account._id }, { isTemp: false });

		await AccountServices.updateOne(account._id, { isBackupEnabled: true, backupEnabledAt: new Date() });

		return BACKUP_ENABLED_SUCCESSFULLY;
	}

	static async disable(account) {
		if (!account.isBackupEnabled) {
			throw new BadRequestException(BAKCUP_ALREADY_DISABLED);
		}

		await BackupServices.delete({ account: account._id });

		await AccountServices.updateOne(account._id, { isBackupEnabled: false }, { backupEnabledAt: 1 });

		return BACKUP_DISABLED_SUCCESSFULLY;
	}

	static async regenerate() {}

	static async verify() {}

	/* 
		=======================================
			Private methods 
		=======================================
	*/

	static #isBackupAlreadyEnabled(isBackupEnabled) {
		if (isBackupEnabled) {
			throw new BadRequestException(BACKUP_ALREADY_ENABLED);
		}
	}

	static async #generateBackupCodesList(accountId, listLength) {
		const codesList = [];

		for (let i = 0; i < listLength; i++) {
			const backupCodeObject = { accountId, code: RandomHelper.generateRandomString(16) };

			codesList.push(backupCodeObject);
		}

		return codesList;
	}

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

	static async #generateHashSaveBackupCodesList(accountId, backupCodesListLength) {
		const generatedBackupCodesList = await BackupServices.#generateBackupCodesList(accountId, backupCodesListLength);

		const hashedBackupCodesList = await BackupServices.#hashBackupCodesList(generatedBackupCodesList);

		await BackupServices.createMany(hashedBackupCodesList);

		return {
			codes: generatedBackupCodesList.map((el) => el.code),
		};
	}

	static async #verifyBackupCode(accountId, givenBackupCode) {
		const accountHashedBackupCodesList = await BackupServices.find({ accountId });

		if (accountHashedBackupCodesList.length === 0) {
			throw new BadRequestException(BACKUP_NOT_GENERATED);
		}

		const matchedBackupCode = accountHashedBackupCodesList
			.filter(async (accountHashedBackupCode) => await HashHelper.verify(givenBackupCode, accountHashedBackupCode.code))
			.map(({ _id, code }) => ({ _id, code }))
			.shift();

		if (!matchedBackupCode) {
			throw new UnauthorizedException(INVALID_BACKUP_CODE);
		}

		return matchedBackupCode;
	}

	static async #verifyDeleteBackupCode(accountId, givenBackupCode) {
		const { code } = await BackupServices.#verifyBackupCode(accountId, givenBackupCode);

		return await BackupServices.deleteOne({ accountId, code });
	}

	/* 
		=======================================
			CRUD methods 
		=======================================
	*/

	static async createMany(backupCodesList) {
		const areBackupCodesCreated = await BackupRepository.createMany(backupCodesList);

		if (!areBackupCodesCreated) {
			throw new InternalServerException(BACKUP_CREATE_FAILED);
		}

		return areBackupCodesCreated;
	}

	static async findOne(payload) {
		const isBackupCodeFound = await BackupRepository.findOne(payload);

		if (!isBackupCodeFound) {
			throw new InternalServerException(INVALID_BACKUP_CODE);
		}

		return isBackupCodeFound;
	}

	static async find(payload) {
		return await BackupRepository.find(payload);
	}

	static async update(filter, setPayload, unsetPayload) {
		const { modifiedCount } = await BackupRepository.update(filter, setPayload, unsetPayload);

		if (modifiedCount === 0) {
			throw new InternalServerException(BACKUP_UPDATE_FAILED);
		}
	}

	static async deleteOne(payload) {
		const { deletedCount } = await BackupRepository.deleteOne(payload);

		if (deletedCount === 0) {
			throw new InternalServerException(BACKUP_DELETE_FAILED);
		}
	}

	static async delete(payload) {
		const { deletedCount } = await BackupRepository.delete(payload);

		if (deletedCount === 0) {
			throw new InternalServerException(BACKUP_DELETE_FAILED);
		}
	}
}

module.exports = BackupServices;
