const AccountServices = require("./../account/account.services");
const TotpRepository = require("./totp.repositories");
const TotpHelper = require("./../../helpers/totp");

const {
	SUCCESS_MESSAGES: { TOTP_ENABLED_SUCCESSFULLY, TOTP_DISABLED_SUCCESSFULLY, TOTP_VERIFIED_SUCCESSFULLY },
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
	UnAuthorizedException,
	NotFoundException,
} = require("./../../exceptions/index");

class TotpServices {
	/* 
		=======================================
			Public methods 
		=======================================
	*/

	static async initiateEnabling(accountId, isTotpEnabled) {
		if (isTotpEnabled) {
			throw new BadRequestException(TOTP_ALREADY_ENABLED);
		}

		const { plainTextTotpSecret, encryptedTotpSecret } = await TotpServices.#generateEncryptedTotpSecret();

		await TotpServices.createOne({ accountId, secret: encryptedTotpSecret });

		return { secret: plainTextTotpSecret };
	}

	static async confirmEnabling(accountId, givenTotp, isTotptEnabled) {
		if (isTotptEnabled) {
			throw new BadRequestException(TOTP_ALREADY_ENABLED);
		}

		const { _id: totpId, secret, isTemp, count } = await TotpServices.findOne({ accountId });

		if (!isTemp) {
			throw new BadRequestException(TOTP_ALREADY_CONFIRMED);
		}

		if (count >= 3) {
			await TotpServices.deleteOne({ _id: totpId });

			throw new BadRequestException(START_FROM_SCRATCH);
		}

		await TotpServices.#verifyTotpCode({
			totpId,
			secret,
			count,
			givenTotp,
		});

		await TotpServices.updateOne({ _id: totpId }, { isTemp: false }, { count: 1 });

		await AccountServices.updateOne({ _id: accountId }, { isTotpEnabled: true, totpEnabledAt: new Date() });

		return TOTP_ENABLED_SUCCESSFULLY;
	}

	static async disable(accountId, isTotpEnabled) {
		if (!isTotpEnabled) {
			throw new BadRequestException(TOTP_ALREADY_DISABLED);
		}

		await TotpServices.deleteOne({ accountId });

		await AccountServices.updateOne({ _id: accountId }, { isTotpEnabled: false }, { totpEnabledAt: 1 });

		return TOTP_DISABLED_SUCCESSFULLY;
	}

	static async verify(accountId, givenTotp) {
		const { isTotpEnabled } = await AccountServices.findOne({ _id: accountId });

		if (!isTotpEnabled) {
			throw new BadRequestException(TOTP_NOT_ENABLED);
		}

		const totp = await TotpServices.findOne({ accountId });

		if (!totp) {
			throw new UnAuthorizedException(INVALID_TOTP);
		}

		await TotpServices.#verifyTotpCode({ totpId: totp._id, secret: totp.secret, count: totp.count, givenTotp });

		return TOTP_VERIFIED_SUCCESSFULLY;
	}

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
			await TotpServices.updateOne({ _id: totpId }, { count: count + 1 });

			throw new UnAuthorizedException(INVALID_TOTP);
		}
	}

	/* 
		=======================================
			CRUD methods 
		=======================================
	*/

	static async createOne(payload) {
		const isTotpCreated = await TotpRepository.insertOne(payload);

		if (!isTotpCreated) {
			throw new InternalServerException(TOTP_CREATE_FAILED);
		}

		return isTotpCreated;
	}

	static async findOne(payload) {
		return await TotpRepository.findOne(payload);
	}

	static async updateOne(filter, setPayload, unsetPayload) {
		const isTotpUpdated = await TotpRepository.updateOne(filter, setPayload, unsetPayload);

		if (!isTotpUpdated) {
			throw new InternalServerException(TOTP_UPDATE_FAILED);
		}

		return isTotpUpdated;
	}

	static async deleteOne(filter) {
		const isTotpDeleted = await TotpRepository.deleteOne(filter);

		if (!isTotpDeleted) {
			throw new NotFoundException(TOTP_NOT_FOUND);
		} else if (isTotpDeleted.deletedCount === 0) {
			throw new InternalServerException(TOTP_DELETE_FAILED);
		}
	}

	static async deleteMany(filter) {
		const areTotpDeleted = await TotpRepository.deleteMany(filter);

		if (!areTotpDeleted) {
			throw new NotFoundException(TOTP_NOT_FOUND);
		} else if (areTotpDeleted.deletedCount === 0) {
			throw new InternalServerException(TOTP_DELETE_FAILED);
		}
	}
}

module.exports = TotpServices;
