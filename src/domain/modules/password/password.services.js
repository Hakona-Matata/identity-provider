const {
	SUCCESS_MESSAGES: { PASSWORD_CHANGED_SUCCESSFULLY, CHECK_MAIL_BOX, ACCOUNT_RESET_SUCCESSFULLY },
	FAILURE_MESSAGES: { INCORRECT_PASSWORD, ALREADY_HAVE_VALID_RESET_LINK, ALREADY_RESET_ACCOUNT },
} = require("./password.constants");

const { ForbiddenException } = require("./../../../shared/exceptions");

const { TokenHelper, HashHelper } = require("../../../shared/helpers");

const AccountServices = require("../account/account.services");
const SessionServices = require("../session/session.services");

/**
 * A class that handles password-related operations like changing password, requesting a password reset link and resetting the password
 *
 * @class
 */
class PasswordServices {
	/** Changes the password of an authenticated account
	 * @async
	 * @param {Object} data - An object containing oldPassword, newPassword, accountId and accountPassword
	 * @param {string} data.oldPassword - The old password of the account
	 * @param {string} data.newPassword - The new password that the account will be updated with
	 * @param {string} data.accountId - The id of the account that the password will be updated
	 * @param {string} data.accountPassword - The hashed password of the account that the password will be updated
	 * @returns {string} - A string indicating that the password has been changed successfully
	 */
	static async change({ oldPassword, password, accountId, accountPassword }) {
		const isPasswordValid = await HashHelper.verify(oldPassword, accountPassword);

		if (!isPasswordValid) {
			throw new ForbiddenException(INCORRECT_PASSWORD);
		}

		const hashedPassword = await HashHelper.generate(password);

		await AccountServices.updateOne({ _id: accountId }, { password: hashedPassword, passwordChangedAt: new Date() });

		await SessionServices.deleteMany({ accountId });

		return PASSWORD_CHANGED_SUCCESSFULLY;
	}

	/**
	 * Generates a password reset token for an account and sends it to the account's email
	 *
	 * @async
	 * @param {string} email - The email of the account that the password reset request is made for
	 * @returns {string} - A string indicating that the reset link has been sent to the user's email
	 * @throws {ForbiddenException} - Throws when the account has already requested a reset link and the link is still valid
	 */
	static async forget(email) {
		const account = await AccountServices.findOne({ email });

		if (!account) return CHECK_MAIL_BOX;

		if (account && account.resetToken) {
			const decodedResetToken = await TokenHelper.verifyResetToken(account.resetToken);

			if (decodedResetToken) throw new ForbiddenException(ALREADY_HAVE_VALID_RESET_LINK);
		}

		const resetToken = await TokenHelper.generateResetToken({ accountId: account._id, role: account.role });

		const resetLink = `${process.env.BASE_URL}:${process.env.PORT}/auth/password/reset/${resetToken}`;

		// TODO: Send Email
		if (process.env.NODE_ENV === "development") console.log({ resetLink });

		await AccountServices.updateOne({ _id: account._id }, { resetToken, resetAt: new Date() });

		return CHECK_MAIL_BOX;
	}

	/**
	 * Resets the password of an account using a password reset token
	 *
	 * @async
	 * @param {Object} data - An object containing resetToken and password
	 * @param {string} data.resetToken - The reset token that is generated for the account
	 * @param {string} data.password - The new password that the account will be updated with
	 * @returns {string} - A string indicating that the account password has been reset successfully
	 * @throws {ForbiddenException} - Throws when the given reset token is invalid or has already been used
	 */
	static async reset({ resetToken: givenAccountResetToken, password: givenAccountPassword }) {
		const { accountId } = await TokenHelper.verifyResetToken(givenAccountResetToken);

		const account = await AccountServices.findById(accountId);

		if (account && !account.resetToken) throw new ForbiddenException(ALREADY_RESET_ACCOUNT);

		const hashedPassword = await HashHelper.generate(givenAccountPassword);

		await AccountServices.updateOne(
			{ _id: accountId },
			{ password: hashedPassword, resetAt: new Date() },
			{ resetToken: 1 }
		);

		await SessionServices.deleteMany({ accountId });

		return ACCOUNT_RESET_SUCCESSFULLY;
	}
}

module.exports = PasswordServices;
