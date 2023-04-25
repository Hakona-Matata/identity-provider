const SessionServices = require("./../session/session.services");
const AccountRepository = require("./account.repositories");
const TokenHelper = require("../../helpers/tokenHelper");
const HashHelper = require("../../helpers/hashHelper");

const {
	SUCCESS_MESSAGES: {
		DEACTIVATED_SUCCESSFULLY,
		CHECK_MAIL_BOX,
		ACTIVATED_SUCCESSFULLY,
		ACCOUNT_DELETED_SUCCESSFULLY,
		CANCELED_ACCOUNT_DELETION,
	},
	FAILURE_MESSAGES: {
		ACCOUNT_NEED_TO_BE_VERIFIED,
		ACCOUNT_NEED_TO_BE_ACTIVE,
		ACCOUNT_ALREADY_ACTIVE,
		ALREADY_HAVE_VALID_ACTIVATION_LINK,
		ALREADY_CANCELED_ACCOUNT_DELETION,
		ACCOUNT_CREATION_FAILED,
		ACCOUNT_DELETION_FAILED,
		ACCOUNT_NOT_FOUND,
	},
} = require("./account.constants");

const {
	BadRequestException,
	UnAuthorizedException,
	InternalServerException,
	NotFoundException,
} = require("./../../exceptions/index");

class AccountServices {
	/* 
		=======================================
			Public methods 
		=======================================
	*/
	static async deactivate(accountId) {
		await AccountServices.updateOne({ _id: accountId }, { isActive: false, activeStatusChangedAt: new Date() });

		await SessionServices.deleteMany({ accountId });

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

		await AccountServices.updateOne({ _id: account._id }, { activationToken });

		return CHECK_MAIL_BOX;
	}

	static async confirmActivation(activationToken) {
		const { accountId } = await TokenHelper.verifyActivationToken(activationToken);

		const account = await AccountServices.findById(accountId);

		await AccountServices.#isAccountAlreadyActive(account.isActive);

		await AccountServices.isAccountVerified(account.isVerified);

		await AccountServices.updateOne(
			{ _id: accountId },
			{ isActive: true, activeStatusChangedAt: new Date() },
			{ activationToken: 1 }
		);

		return ACTIVATED_SUCCESSFULLY;
	}

	static async terminate(accountId) {
		await AccountServices.updateOne({ _id: accountId }, { isDeleted: true, isDeletedAt: new Date() });

		return ACCOUNT_DELETED_SUCCESSFULLY;
	}

	static async cancelTermination(accountId) {
		const foundAccount = await AccountServices.findById(accountId);

		if (!foundAccount.isDeleted) {
			throw new BadRequestException(ALREADY_CANCELED_ACCOUNT_DELETION);
		}

		await AccountServices.updateOne({ _id: accountId }, { isDeleted: false }, { isDeletedAt: 1 });

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
			throw new UnAuthorizedException(ACCOUNT_NEED_TO_BE_ACTIVE);
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

	static async createOne(payload) {
		const password = await HashHelper.generate(payload.password);

		const isAccountCreated = await AccountRepository.insertOne({ ...payload, password });

		if (!isAccountCreated) {
			throw new InternalServerException(ACCOUNT_CREATION_FAILED);
		}

		return isAccountCreated;
	}

	static async findById(accountId) {
		return await AccountRepository.findById(accountId);
	}

	static async findOne(payload) {
		return await AccountRepository.findOne(payload);
	}

	static async updateOne(filter, setPayload, unsetPayload) {
		const isAccountUpdated = await AccountRepository.updateOne(filter, setPayload, unsetPayload);

		if (!isAccountUpdated) {
			throw new NotFoundException(ACCOUNT_NOT_FOUND);
		}

		return isAccountUpdated;
	}

	static async deleteOne(accountId) {
		const isAccountDeleted = await AccountRepository.deleteOne(accountId);

		if (!isAccountDeleted) {
			throw new NotFoundException(ACCOUNT_NOT_FOUND);
		} else if (isAccountDeleted.deletedCount === 0) {
			throw new InternalServerException(ACCOUNT_DELETION_FAILED);
		}
	}
}

module.exports = AccountServices;
