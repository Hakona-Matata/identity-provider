const {
	SUCCESS_MESSAGES: { TOTP_ENABLED_SUCCESSFULLY },
	FAILURE_MESSAGES: {
		TOTP_ALREADY_ENABLED,
		TOTP_ALREADY_CONFIRMED,
		START_FROM_SCRATCH,
		INVALID_TOTP,

		TOTP_CREATE_FAILED,
		TOTP_READ_FAILED,
		TOTP_UPDATE_FAILED,
		TOTP_DELETE_FAILED,
	},
} = require("./totp.constants");

const BadRequestException = require("./../../Exceptions/common/badRequest.exception");
const InternalServerException = require("./../../Exceptions/common/internalServer.exception");
const UnAuthorizedException = require("./../../Exceptions/common/unAuthorized.exception");

const AccountServices = require("./../account/account.services");
const TotpRepository = require("./totp.repositories");

const TotpHelper = require("./../../helpers/totp");

class TotpServices {
	/* 
		=======================================
			Public methods 
		=======================================
	*/
	static async intiateEnabling({ accountId, isTotpEnabled }) {
		if (isTotpEnabled) {
			throw new BadRequestException(TOTP_ALREADY_ENABLED);
		}

		await TotpServices.delete(accountId);

		const { plainTextTotpSecret, encryptedTotpSecret } = await TotpServices.#generateEncryptedTotpSecret();

		await TotpServices.create({ accountId, secret: encryptedTotpSecret });

		return { secret: plainTextTotpSecret };
	}

	static async confirmEnabling({ accountId, givenTotp, isTotptEnabled }) {
		if (isTotptEnabled) {
			throw new BadRequestException(TOTP_ALREADY_ENABLED);
		}

		const { _id: totpId, secret, isTemp, count } = await TotpServices.findOne({ accountId });

		if (!isTemp) {
			throw new BadRequestException(TOTP_ALREADY_CONFIRMED);
		}

		if (count >= 3) {
			await TotpServices.deleteOne(totpId);

			throw new BadRequestException(START_FROM_SCRATCH);
		}

		await TotpServices.#verifyTotpCode({
			totpId,
			secret,
			count,
			givenTotp,
		});

		await TotpServices.updateOne(totpId, { isTemp: false }, { count: 1 });

		await AccountServices.updateOne(accountId, { isTotpEnabled: true, totpEnabledAt: new Date() });

		return TOTP_ENABLED_SUCCESSFULLY;
	}

	static async disable() {}

	/* 
		=======================================
			Private methods 
		=======================================
	*/

	static async #generateEncryptedTotpSecret() {
		const { plainTextTotpSecret, encryptedTotpSecret } = TotpHelper.generateTotpSecret();

		return { plainTextTotpSecret, encryptedTotpSecret };
	}

	static async #verifyTotpCode({ totpId, secret, count, givenTotp }) {
		const isTotpValid = TotpHelper.verifyTotpCode(givenTotp, secret);

		if (!isTotpValid) {
			await TotpServices.updateOne(totpId, { count: count + 1 });

			throw new UnAuthorizedException(INVALID_TOTP);
		}
	}

	/* 
		=======================================
			CRUD methods 
		=======================================
	*/

	static async create(payload) {
		const isTotpCreated = await TotpRepository.create(payload);

		if (!isTotpCreated) {
			throw new InternalServerException(TOTP_CREATE_FAILED);
		}

		return isTotpCreated;
	}

	static async findOne(payload) {
		const isTotpFound = await TotpRepository.findOne(payload);

		if (!isTotpFound) {
			throw new InternalServerException(TOTP_READ_FAILED);
		}

		return isTotpFound;
	}

	static async updateOne(totpId, setPayload, unsetPayload) {
		const isTotpUpdated = await TotpRepository.updateOne(totpId, setPayload, unsetPayload);

		if (!isTotpUpdated) {
			throw new InternalServerException(TOTP_UPDATE_FAILED);
		}

		return isTotpUpdated;
	}

	static async deleteOne(totpId) {
		const { deletedCount } = await TotpRepository.deleteOne(totpId);

		if (deletedCount === 0) {
			throw new InternalServerException(TOTP_DELETE_FAILED);
		}
	}

	static async delete(accountId) {
		return await TotpRepository.delete({ accountId });
	}
}

module.exports = TotpServices;
