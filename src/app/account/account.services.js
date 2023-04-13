const SessionServices = require("./../session/session.services");
const AccountRepository = require("./account.repositories");

const { SUCCESS_MESSAGES, FAILIURE_MESSAGES } = require("../../constants/messages");

const BadRequestError = require("./../../Exceptions/common/badRequest.exception");
const UnAuthorizedError = require("./../../Exceptions/common/unAuthorized.exception");

const TokenHelper = require("./../../helpers/token");
const HashHelper = require("./../../helpers/hash");

class AccountServices {
	static async signUp(payload) {
		const account = await AccountRepository.createAccount({ ...payload });

		const verificationToken = await TokenHelper.generateVerificationToken({
			_id: account.id,
			role: account.role,
		});

		const verificationLink = `${process.env.BASE_URL}:${process.env.PORT}/auth/verify-email/${verificationToken}`;

		// TODO: Send email
		console.log({ verificationLink });

		await AccountRepository.updateAccountWithVerificationToken(account._id, verificationToken);

		return SUCCESS_MESSAGES.SIGN_UP_SUCCESSFULLY;
	}

	static async verify(token) {
		const { _id: accountId } = await TokenHelper.verifyVerificationToken(token);

		const foundAccount = await AccountRepository.findAccountById(accountId);

		if (foundAccount && foundAccount.isVerified) {
			throw new BadRequestError(FAILIURE_MESSAGES.ACCOUNT_ALREADY_VERIFIED);
		}

		await AccountRepository.updateAccountToBeVerified(accountId);

		return SUCCESS_MESSAGES.ACCOUNT_VERIFIED_SUCCESSFULLY;
	}

	static async logIn({ email, password }) {
		const foundAccount = await AccountRepository.findAccountByEmail(email);

		if (!foundAccount) {
			throw new UnAuthorizedError(FAILIURE_MESSAGES.WRONG_EMAIL_OR_PASSWORD);
		}

		AccountServices.isVerifiedActiveNotDeleted(foundAccount);

		const isPasswordCorrect = await HashHelper.verify(password, foundAccount.password);

		if (!isPasswordCorrect) {
			throw new UnAuthorizedError(FAILIURE_MESSAGES.WRONG_EMAIL_OR_PASSWORD);
		}

		// TODO: what is 2fa are enalbed? refactor!

		return await SessionServices.create({
			accountId: foundAccount._id,
			role: foundAccount.role,
		});
	}

	static async logOut({ userId, accessToken }) {
		console.log({ userId, accessToken });
		// TODO: Deal with sesion service!
		// const isUserLoggedOut = await Session.findOneAndDelete({
		// 	userId,
		// 	accessToken,
		// });

		return SUCCESS_MESSAGES.LOGGED_OUT_SUCCESSFULLY;
	}

	// TODO: work more on temp delete and deleted
	static isVerifiedActiveNotDeleted(account) {
		AccountServices.isVerified(account.isVerified);
		AccountServices.isActive(account.isActive);
		AccountServices.isNotDeleted(account.isTempDeleted);
	}

	static isVerified(isVerified) {
		if (!isVerified) {
			throw new UnAuthorizedError(FAILIURE_MESSAGES.ACCOUNT_NEED_TO_BE_VERIFIED);
		}
	}

	static isActive(isActive) {
		if (!isActive) {
			throw new UnAuthorizedError(FAILIURE_MESSAGES.ACCOUNT_NEET_TO_BE_ACTIVE);
		}
	}

	static isNotDeleted(isTempDeleted) {
		if (isTempDeleted) {
			throw new UnAuthorizedError(FAILIURE_MESSAGES.ACCOUNT_TEMP_DELETED);
		}
	}
}

module.exports = AccountServices;
