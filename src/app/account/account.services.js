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

const BadRequestException = require("./../../Exceptions/common/badRequest.exception");
const UnAuthorizedException = require("./../../Exceptions/common/unAuthorized.exception");

const SessionServices = require("./../session/session.services");
const SessionRepository = require("../session/session.repositories");
const AccountRepository = require("./account.repositories");

const TokenHelper = require("./../../helpers/token");
const HashHelper = require("./../../helpers/hash");
const InternalServerException = require("../../Exceptions/common/internalServer.exception");

class AccountServices {
	static async deactivate(accountId) {
		await AccountRepository.updateOne(accountId, { isActive: false, activeStatusChangedAt: new Date() });

		await SessionRepository.deleteMany(accountId);

		return DEACTIVATED_SUCCESSFULLY;
	}

	static async activate(accountEmail) {
		const account = await AccountRepository.findOne(accountEmail);

		if (!account) {
			return CHECK_MAIL_BOX;
		}

		if (account && account.isActive) {
			throw new BadRequestException(ACCOUNT_ALREADY_ACTIVE);
		}

		await AccountServices.isVerified(account.isVerified);

		await AccountServices.#checkIfActivationTokenExists(account.activationToken);

		const activationToken = await TokenHelper.generateActivationToken({
			accountId: account._id,
			role: account.role,
		});

		const activationLink = `${process.env.BASE_URL}:${process.env.PORT}/auth/account/activate/${activationToken}`;

		// TODO: Send email
		console.log({ activationLink });

		await AccountRepository.updateOne(account._id, { activationToken });

		return CHECK_MAIL_BOX;
	}

	static async confirmActivation(activationToken) {
		const { accountId } = await TokenHelper.verifyActivationToken(activationToken);

		const account = await AccountRepository.findOneById(accountId);

		await AccountServices.#isAlreadyActive(account.isActive);
		await AccountServices.isVerified(account.isVerified);

		await AccountRepository.updateOne(
			accountId,
			{ isActive: true, activeStatusChangedAt: new Date() },
			{ activationToken: 1 }
		);

		return ACTIVATED_SUCCESSFULLY;
	}

	static async terminate(accountId) {
		await AccountRepository.updateOne(accountId, { isDeleted: true, isDeletedAt: new Date() });

		return ACCOUNT_DELETED_SUCCESSFULLY;
	}

	static async cancelTermination(accountId) {
		const foundAccount = await AccountRepository.findOneById(accountId);

		if (!foundAccount.isDeleted) {
			throw new BadRequestException(ALREADY_CANCELED_ACCOUNT_DELETION);
		}

		await AccountRepository.updateOne(accountId, { isDeleted: false }, { isDeletedAt: 1 });

		return CANCELED_ACCOUNT_DELETION;
	}

	// TODO: work more on temp delete and deleted
	static isVerifiedActive(account) {
		AccountServices.isVerified(account.isVerified);
		AccountServices.isActive(account.isActive);
	}

	static isVerified(isVerified) {
		if (!isVerified) {
			throw new UnAuthorizedException(ACCOUNT_NEED_TO_BE_VERIFIED);
		}
	}

	static isActive(isActive) {
		if (!isActive) {
			throw new UnAuthorizedException(ACCOUNT_NEET_TO_BE_ACTIVE);
		}
	}

	static #isAlreadyActive(isActive) {
		if (isActive) {
			throw new BadRequestException(ACCOUNT_ALREADY_ACTIVE);
		}
	}

	static async #checkIfActivationTokenExists(activationToken) {
		if (activationToken) {
			const decodedActivationToken = await TokenHelper.verifyActivationToken(activationToken);

			if (decodedActivationToken) {
				throw new BadRequestException(ALREADY_HAVE_VALID_ACTIVATION_LINK);
			}
		}
	}

	//-------------------------------------------------------------
	//-------------------------------------------------------------
	//-------------------------------------------------------------
	//-------------------------------------------------------------

	static async findeOneById(accountId) {
		const isAccountFound = await AccountRepository.findOne({ _id: accountId });

		if (!isAccountFound) {
			throw new InternalServerException(ACCOUNT_READ_FAILED);
		}

		return isAccountFound;
	}

	static async findeOne(payload) {
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
}

module.exports = AccountServices;
