const TokenHelper = require("./../../helpers/token");
const HashHelper = require("./../../helpers/hash");

const AccountServices = require("./../account/account.services");
const SessionServices = require("./../session/session.services");

const OtpServices = require("./../otp/otp.services");
const SmsServices = require("./../sms/sms.services");
const TotpServices = require("./../totp/totp.services");

const {
	SUCCESS_MESSAGES: { SIGN_UP_SUCCESSFULLY, ACCOUNT_VERIFIED_SUCCESSFULLY, LOGGED_OUT_SUCCESSFULLY },
	FAILIURE_MESSAGES: { ACCOUNT_ALREADY_VERIFIED, WRONG_EMAIL_OR_PASSWORD },
} = require("./auth.constants");

const { UnAuthorizedException } = require("./../../exceptions/index");

class AuthServices {
	static async signUp(payload) {
		const { _id: accountId, role } = await AccountServices.createOne(payload);

		const verificationToken = await TokenHelper.generateVerificationToken({
			accountId,
			role,
		});

		const verificationLink = `${process.env.BASE_URL}:${process.env.PORT}/auth/verify-email/${verificationToken}`;

		// TODO: Send email
		console.log({ verificationLink });

		await AccountServices.updateOne({ _id: accountId }, { verificationToken });

		return SIGN_UP_SUCCESSFULLY;
	}

	static async verify(verificationToken) {
		const { accountId } = await TokenHelper.verifyVerificationToken(verificationToken);

		const foundAccount = await AccountServices.findById(accountId);

		if (foundAccount && foundAccount.isVerified) {
			throw new BadRequestException(ACCOUNT_ALREADY_VERIFIED);
		}

		await AccountServices.updateOne(
			{ _id: accountId },
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

		return await AuthServices.#giveAccess(foundAccount);
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

	static async #giveAccess(account) {
		const enabledSecurityMethods = await AuthServices.getEnabledSecurityLayers(account);

		switch (enabledSecurityMethods.length) {
			case 0:
				return await SessionServices.createOne({
					accountId: foundAccount._id,
					role: foundAccount.role,
				});

			case 1:
				return await AuthServices.#giveAccessOneSecurityLayerEnabled(account, enabledSecurityMethods);

			default:
				// the front end should redirect him to a page with all the enabled security layers
				// and once the user choose his desired way, the frontend sends a requet to it's verify endpoint!
				return {
					message: "Please choose one of these security methods!",
					accountId: account._id,
					methods: enabledSecurityMethods,
				};
		}
	}

	static async #giveAccessOneSecurityLayerEnabled(account, enabledSecurityMethods) {
		const enabledMethodName = Object.keys(enabledSecurityMethods[0])[0];

		switch (enabledMethodName) {
			case "isOtpEnabled":
				return OtpServices.send(account._id);

			case "isSmsEnabled":
				return SmsServices.send(account._id);

			// this case is if the isTotpEnabled: true
			default:
				return { accountId: account._id };
		}
	}
}

module.exports = AuthServices;
