const TokenHelper = require("../../helpers/tokenHelper");
const HashHelper = require("../../helpers/hashHelper");

const AccountServices = require("./../account/account.services");
const SessionServices = require("./../session/session.services");

const OtpServices = require("./../otp/otp.services");
const SmsServices = require("./../sms/sms.services");

const {
	SUCCESS_MESSAGES: { SIGN_UP_SUCCESSFULLY, ACCOUNT_VERIFIED_SUCCESSFULLY, LOGGED_OUT_SUCCESSFULLY },
	FAILURE_MESSAGES: { ACCOUNT_ALREADY_VERIFIED, WRONG_EMAIL_OR_PASSWORD },
} = require("./auth.constants");

const { UnAuthorizedException, BadRequestException } = require("./../../exceptions/index");

/**
 * AuthServices is a class that provides various services like sign up, verify, log in, and log out.
 */
class AuthServices {
	/**
	 * Signs up a new user with the given payload.
	 *
	 * @async
	 * @param {Object} payload - An object containing the user's details.
	 * @param {string} payload.email - The user's email address.
	 * @param {string} payload.password - The user's password.
	 * @param {string} payload.firstName - The user's first name.
	 * @param {string} payload.lastName - The user's last name.
	 * @returns {Promise<string>} - A Promise that resolves with a success message.
	 */
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

	/**
	 * Verifies the account using the verification token.
	 *
	 * @async
	 * @param {string} verificationToken - The verification token.
	 * @returns {Promise<string>} - A Promise that resolves to ACCOUNT_VERIFIED_SUCCESSFULLY on success.
	 */
	static async verify(verificationToken) {
		const { accountId } = await TokenHelper.verifyVerificationToken(verificationToken);

		const foundAccount = await AccountServices.findById(accountId);

		const isAccountAlreadyVerified = foundAccount && foundAccount.isVerified && !foundAccount.verificationToken;

		if (!foundAccount || isAccountAlreadyVerified) {
			throw new BadRequestException(ACCOUNT_ALREADY_VERIFIED);
		}

		await AccountServices.updateOne(
			{ _id: accountId },
			{ isVerified: true, isVerifiedAt: new Date() },
			{ verificationToken: 1 }
		);

		return ACCOUNT_VERIFIED_SUCCESSFULLY;
	}

	/**
	 * Logs in a user with the given email and password.
	 *
	 * @async
	 * @param {Object} data - An object containing the user's email and password.
	 * @param {string} data.email - The user's email address.
	 * @param {string} data.password - The user's password.
	 * @returns {Promise<any>} - A Promise that resolves with the logged-in user's data.
	 */
	static async logIn(data) {
		const account = await AccountServices.findOne({ email: data.email });

		if (!account) {
			throw new UnAuthorizedException(WRONG_EMAIL_OR_PASSWORD);
		}

		AccountServices.isAccountVerifiedActive(account);

		const isPasswordCorrect = await HashHelper.verify(data.password, account.password);

		if (!isPasswordCorrect) {
			throw new UnAuthorizedException(WRONG_EMAIL_OR_PASSWORD);
		}

		return await AuthServices.#giveAccess(account);
	}

	/**
	 * Logout the user with the given account ID and access token.
	 *
	 * @async
	 * @param {Object} options - The options object.
	 * @param {string} options.accountId - The ID of the account to log out.
	 * @param {string} options.accessToken - The access token to use for authentication.
	 * @returns {Promise<string>} - A Promise that resolves with a success message upon successful logout.
	 * @throws {Error} Throws an error if there is a problem logging out.
	 */
	static async logOut({ accountId, accessToken }) {
		await SessionServices.deleteOne({ accountId, accessToken });

		return LOGGED_OUT_SUCCESSFULLY;
	}

	/**
	 * Returns an array of objects, each object representing an enabled security layer for the given account.
	 *
	 * @async
	 * @param {Object} account - The account object for which to retrieve the enabled security layers.
	 * @param {boolean} account.isOtpEnabled - Whether OTP (One Time Password) is enabled for the account.
	 * @param {boolean} account.isSmsEnabled - Whether SMS (Short Message Service) is enabled for the account.
	 * @param {boolean} account.isTotpEnabled - Whether TOTP (Time-Based One Time Password) is enabled for the account.
	 * @returns {Promise<Array>} - A promise that resolves to an array of objects, each object representing an enabled security layer.
	 */
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

	/**
	 * Returns an array of objects, each object representing an enabled security layer for the given account.
	 *
	 * @async
	 * @static
	 * @param {Object} account - The account object for which to retrieve the enabled security layers.
	 * @param {boolean} account.isOtpEnabled - Whether OTP (One Time Password) is enabled for the account.
	 * @param {boolean} account.isSmsEnabled - Whether SMS (Short Message Service) is enabled for the account.
	 * @param {boolean} account.isTotpEnabled - Whether TOTP (Time-Based One Time Password) is enabled for the account.
	 * @returns {Promise<Array>} - A promise that resolves to an array of objects, each object representing an enabled security layer for the given account.
	 */
	static async #giveAccess(account) {
		const enabledSecurityMethods = await AuthServices.getEnabledSecurityLayers(account);

		switch (enabledSecurityMethods.length) {
			case 0:
				return await SessionServices.createOne({
					accountId: account._id,
					role: account.role,
				});

			case 1:
				return await AuthServices.#giveAccessOneSecurityLayerEnabled(account, enabledSecurityMethods);

			default:
				// the front end should redirect him to a page with all the enabled security layers
				// and once the user choose his desired way, the frontend sends a request to it's verify endpoint!
				return {
					message: "Please choose one of these security methods!",
					accountId: account._id,
					methods: enabledSecurityMethods,
				};
		}
	}

	/**
	 * Give access to one of the enabled security layers for the specified account.
	 *
	 * @async
	 * @static
	 * @private
	 * @param {Object} account - The account object.
	 * @param {Array} enabledSecurityMethods - An array containing objects that specify the enabled security methods for the account.
	 * @returns {Promise<any>} - A promise that resolves with the result of the security layer access method.
	 */
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
