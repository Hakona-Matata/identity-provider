const {
	SUCCESS_MESSAGES: { SIGN_UP_SUCCESSFULLY, ACCOUNT_VERIFIED_SUCCESSFULLY, LOGGED_OUT_SUCCESSFULLY },
	FAILIURE_MESSAGES: { ACCOUNT_ALREADY_VERIFIED, WRONG_EMAIL_OR_PASSWORD },
} = require("./auth.constants");

const TokenHelper = require("./../../helpers/token");
const HashHelper = require("./../../helpers/hash");

const AccountServices = require("./../account/account.services");
const SessionServices = require("./../session/session.services");

const { UnAuthorizedException } = require("./../../Exceptions/index");

class AuthServices {
	static async signUp(payload) {
		const { _id: accountId, role } = await AccountServices.create(payload);

		const verificationToken = await TokenHelper.generateVerificationToken({
			accountId,
			role,
		});

		const verificationLink = `${process.env.BASE_URL}:${process.env.PORT}/auth/verify-email/${verificationToken}`;

		// TODO: Send email
		console.log({ verificationLink });

		await AccountServices.updateOne(accountId, { verificationToken });

		return SIGN_UP_SUCCESSFULLY;
	}

	static async verify(verificationToken) {
		const { accountId } = await TokenHelper.verifyVerificationToken(verificationToken);

		const foundAccount = await AccountServices.findById(accountId);

		if (foundAccount && foundAccount.isVerified) {
			throw new BadRequestException(ACCOUNT_ALREADY_VERIFIED);
		}

		await AccountServices.updateOne(
			accountId,
			{ isVerified: true, isVerifiedAt: new Date() },
			{ verificationToken: 1 }
		);

		return ACCOUNT_VERIFIED_SUCCESSFULLY;
	}

	static async logIn({ email, password }) {
		const foundAccount = await AccountServices.findOne({ email });

		if (!foundAccount) {
			throw new UnAuthorizedException(WRONG_EMAIL_OR_PASSWORD);
		}

		AccountServices.isAccountVerifiedActive(foundAccount);

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
		await SessionServices.deleteOne({ accountId, accessToken });

		return LOGGED_OUT_SUCCESSFULLY;
	}

	static async getEnabledSecurityLayers(account) {
		const enabledSecurityMethods = [];

		if (account.isOtpEnabled) {
			enabledSecurityMethods.push({ isOtpEnabled: true });
		}

		if (account.isSmsEnabled) {
			enabledSecurityMethods.push({ isSmsEnabled: true });
		}

		if (account.isTotpEnabled) {
			enabledSecurityMethods.push({ isTotpEnabled: true });
		}

		return enabledSecurityMethods;
	}
}

module.exports = AuthServices;
