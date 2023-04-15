const {
	SUCCESS_MESSAGES: {
		SIGN_UP_SUCCESSFULLY,
		ACCOUNT_VERIFIED_SUCCESSFULLY,
		LOGGED_OUT_SUCCESSFULLY,
		DEACTIVATED_SUCCESSFULLY,
		CHECK_MAIL_BOX,
		ACTIVATED_SUCCESSFULLY,
	},
	FAILIURE_MESSAGES: {
		ACCOUNT_ALREADY_VERIFIED,
		WRONG_EMAIL_OR_PASSWORD,
		ACCOUNT_NEED_TO_BE_VERIFIED,
		ACCOUNT_NEET_TO_BE_ACTIVE,
		ACCOUNT_ALREADY_ACTIVE,
		ACCOUNT_TEMP_DELETED,
		ALREADY_HAVE_VALID_ACTIVATION_LINK,
	},
} = require("../../constants/messages");

const BadRequestException = require("./../../Exceptions/common/badRequest.exception");
const UnAuthorizedException = require("./../../Exceptions/common/unAuthorized.exception");

const SessionServices = require("./../session/session.services");
const SessionRepository = require("../session/session.repositories");
const AccountRepository = require("./account.repositories");

const TokenHelper = require("./../../helpers/token");
const HashHelper = require("./../../helpers/hash");

class AccountServices {
	static async signUp(payload) {
		const { _id: accountId, role } = await AccountRepository.create({ ...payload });

		const verificationToken = await TokenHelper.generateVerificationToken({
			accountId,
			role,
		});

		const verificationLink = `${process.env.BASE_URL}:${process.env.PORT}/auth/verify-email/${verificationToken}`;

		// TODO: Send email
		console.log({ verificationLink });

		await AccountRepository.updateOne(accountId, { verificationToken });

		return SIGN_UP_SUCCESSFULLY;
	}

	static async confirmVerification(token) {
		const { accountId } = await TokenHelper.verifyVerificationToken(token);

		const foundAccount = await AccountRepository.findOneById(accountId);

		if (foundAccount && foundAccount.isVerified) {
			throw new BadRequestException(ACCOUNT_ALREADY_VERIFIED);
		}

		await AccountRepository.updateOne(
			accountId,
			{ isVerified: true, isVerifiedAt: new Date() },
			{ verificationToken: 1 }
		);

		return ACCOUNT_VERIFIED_SUCCESSFULLY;
	}

	static async logIn({ email, password }) {
		const foundAccount = await AccountRepository.findOne(email);

		if (!foundAccount) {
			throw new UnAuthorizedException(WRONG_EMAIL_OR_PASSWORD);
		}

		AccountServices.isVerifiedActiveNotDeleted(foundAccount);

		const isPasswordCorrect = await HashHelper.verify(password, foundAccount.password);

		if (!isPasswordCorrect) {
			throw new UnAuthorizedException(WRONG_EMAIL_OR_PASSWORD);
		}

		// TODO: what is 2fa are enalbed? refactor!

		return await SessionServices.create({
			accountId: foundAccount._id,
			role: foundAccount.role,
		});
	}

	static async logOut({ accountId, accessToken }) {
		await SessionRepository.deleteOne({ accountId, accessToken });

		return LOGGED_OUT_SUCCESSFULLY;
	}

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
		await AccountServices.isNotDeleted(account.isDeleted);
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
		await AccountServices.isNotDeleted(account.isDeleted);

		await AccountRepository.updateOne(
			accountId,
			{ isActive: true, activeStatusChangedAt: new Date() },
			{ activationToken: 1 }
		);

		return ACTIVATED_SUCCESSFULLY;
	}

	// TODO: work more on temp delete and deleted
	static isVerifiedActiveNotDeleted(account) {
		AccountServices.isVerified(account.isVerified);
		AccountServices.isActive(account.isActive);
		AccountServices.isNotDeleted(account.isTempDeleted);
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

	static isNotDeleted(isTempDeleted) {
		if (isTempDeleted) {
			throw new UnAuthorizedException(ACCOUNT_TEMP_DELETED);
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
}

module.exports = AccountServices;
