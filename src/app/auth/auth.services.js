const {
	SUCCESS_MESSAGES: { SIGN_UP_SUCCESSFULLY, ACCOUNT_VERIFIED_SUCCESSFULLY, LOGGED_OUT_SUCCESSFULLY },
	FAILIURE_MESSAGES: { ACCOUNT_ALREADY_VERIFIED, WRONG_EMAIL_OR_PASSWORD },
} = require("./auth.constants");

const TokenHelper = require("./../../helpers/token");
const HashHelper = require("./../../helpers/hash");

const AccountServices = require("./../account/account.services");
const AccountRepository = require("./../account/account.repositories");

const SessionServices = require("./../session/session.services");
const SessionRepository = require("./../session/session.repositories");

class AuthServices {
	static async signUp(payload) {
		const { _id: accountId, role } = await AccountRepository.create({ ...payload });

		const verificationToken = await TokenHelper.generateVerificationToken({
			accountId,
			role,
		});

		const verificationLink = `${process.env.BASE_URL}:${process.env.PORT}/auth/account/verify-email/${verificationToken}`;

		// TODO: Send email
		console.log({ verificationLink });

		await AccountRepository.updateOne(accountId, { verificationToken });

		return SIGN_UP_SUCCESSFULLY;
	}

	static async verify(token) {
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

		AccountServices.isVerifiedActive(foundAccount);

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
}

module.exports = AuthServices;
