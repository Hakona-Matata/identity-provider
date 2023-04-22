const {
	SUCCESS_MESSAGES: {
		DEACTIVATED_SUCCESSFULLY,
		CHECK_MAIL_BOX,
		ACTIVATED_SUCCESSFULLY,
		ACCOUNT_DELETED_SUCCESSFULLY,
		CANCELED_ACCOUNT_DELETION,
	},
	FAILIURE_MESSAGES: {
		ACCOUNT_NEED_TO_BE_VERIFIED,
		ACCOUNT_NEET_TO_BE_ACTIVE,
		ACCOUNT_ALREADY_ACTIVE,
		ALREADY_HAVE_VALID_ACTIVATION_LINK,
		ALREADY_CANCELED_ACCOUNT_DELETION,

		ACCOUNT_CREATE_FAILED,
		ACCOUNT_READ_FAILED,
		ACCOUNT_UPDATE_FAILED,
		ACCOUNT_DELETE_FAILED,
	},
} = require("./account.constants");

const { BadRequestException, UnAuthorizedException, InternalServerException } = require("./../../Exceptions/index");

const SessionServices = require("./../session/session.services");
const AccountRepository = require("./account.repositories");

const TokenHelper = require("./../../helpers/token");

class AccountServices {
	/* 
		=======================================
			Public methods 
		=======================================
	*/
	static async deactivate(accountId) {
		await AccountServices.updateOne(accountId, { isActive: false, activeStatusChangedAt: new Date() });

		await SessionServices.delete(accountId);

		return DEACTIVATED_SUCCESSFULLY;
	}

	static async initiateActivation(email) {
		const account = await AccountServices.findOne({ email });

		if (!account) {
			return CHECK_MAIL_BOX;
		}

		account && account.isActive && AccountServices.#isAccountAlreadyActive(account.isActive);

		await AccountServices.isVerified(account.isVerified);

		await AccountServices.#hasValidActivationToken(account.activationToken);

		const activationToken = await TokenHelper.generateActivationToken({
			accountId: account._id,
			role: account.role,
		});

		const activationLink = `${process.env.BASE_URL}:${process.env.PORT}/auth/account/activate/${activationToken}`;

		// TODO: Send email
		console.log({ activationLink });

		await AccountServices.updateOne(account._id, { activationToken });

		return CHECK_MAIL_BOX;
	}

	static async confirmActivation(activationToken) {
		const { accountId } = await TokenHelper.verifyActivationToken(activationToken);

		const account = await AccountServices.findById(accountId);

		await AccountServices.#isAccountAlreadyActive(account.isActive);

		await AccountServices.isVerified(account.isVerified);

		await AccountServices.updateOne(
			accountId,
			{ isActive: true, activeStatusChangedAt: new Date() },
			{ activationToken: 1 }
		);

		return ACTIVATED_SUCCESSFULLY;
	}

	static async terminate(accountId) {
		await AccountServices.updateOne(accountId, { isDeleted: true, isDeletedAt: new Date() });

		return ACCOUNT_DELETED_SUCCESSFULLY;
	}

	static async cancelTermination(accountId) {
		const foundAccount = await AccountServices.findById(accountId);

		if (!foundAccount.isDeleted) {
			throw new BadRequestException(ALREADY_CANCELED_ACCOUNT_DELETION);
		}

		await AccountServices.updateOne(accountId, { isDeleted: false }, { isDeletedAt: 1 });

		return CANCELED_ACCOUNT_DELETION;
	}

	static isAccountVerifiedActive(account) {
		AccountServices.isAccountVerified(account.isVerified);
		AccountServices.isAccountActive(account.isActive);
	}

	static isAccountVerified(isVerified) {
		if (!isVerified) {
			throw new UnAuthorizedException(ACCOUNT_NEED_TO_BE_VERIFIED);
		}
	}

	static isAccountActive(isActive) {
		if (!isActive) {
			throw new UnAuthorizedException(ACCOUNT_NEET_TO_BE_ACTIVE);
		}
	}

	/* 
		=======================================
			Private methods 
		=======================================
	*/

	static #isAccountAlreadyActive(isActive) {
		if (isActive) {
			throw new BadRequestException(ACCOUNT_ALREADY_ACTIVE);
		}
	}

	static async #hasValidActivationToken(activationToken) {
		if (activationToken) {
			const decodedActivationToken = await TokenHelper.verifyActivationToken(activationToken);

			if (decodedActivationToken) {
				throw new BadRequestException(ALREADY_HAVE_VALID_ACTIVATION_LINK);
			}
		}
	}
	/* 
		=======================================
			CRUD methods 
		=======================================
	*/

	static async create(payload) {
		const isAccountCreated = await AccountRepository.create(payload);

		if (!isAccountCreated) {
			throw new InternalServerException(ACCOUNT_CREATE_FAILED);
		}

		return isAccountCreated;
	}

	static async findById(accountId) {
		const isAccountFound = await AccountRepository.findOne({ _id: accountId });

		if (!isAccountFound) {
			throw new InternalServerException(ACCOUNT_READ_FAILED);
		}

		return isAccountFound;
	}

	static async findOne(payload) {
		const isAccountFound = await AccountRepository.findOne(payload);

		if (!isAccountFound) {
			throw new InternalServerException(ACCOUNT_READ_FAILED);
		}

		return isAccountFound;
	}

	static async updateOne(acountId, setPayload, unsetPayload = null) {
		const isAccountUpdated = await AccountRepository.updateOne(acountId, setPayload, unsetPayload);

		if (!isAccountUpdated) {
			throw new InternalServerException(ACCOUNT_UPDATE_FAILED);
		}

		return isAccountUpdated;
	}

	static async deleteOne(accountId) {
		const { deletedCount } = await AccountRepository.deleteOne(accountId);

		if (deletedCount === 0) {
			throw new InternalServerException(ACCOUNT_DELETE_FAILED);
		}
	}
}

module.exports = AccountServices;
