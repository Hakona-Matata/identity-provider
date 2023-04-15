const TokenHelper = require("./../../helpers/token");
const HashHelper = require("./../../helpers/hash");

const {
	SUCCESS_MESSAGES: { PASSWORD_CHANGED_SUCCESSFULLY, CHECK_MAIL_BOX, ACCOUNT_RESET_SUCCESSFULLY },
	FAILIURE_MESSAGES: { INCORRECT_PASSWORD, ALREADY_HAVE_VALID_RESET_LINK, ALREADY_RESET_ACCOUNT },
} = require("./../../constants/messages");
const BadRequestException = require("./../../Exceptions/common/badRequest.exception");
const UnAuthorizedException = require("./../../Exceptions/common/unAuthorized.exception");
const ForbiddenException = require("./../../Exceptions/common/forbidden.exception");

const AccountRepository = require("./../account/account.repositories");
const SessionRepository = require("./../session/session.repositories");
class PasswordServices {
	static async change({ oldPassword, newPassword, accountId, accountPassword }) {
		const isPasswordValid = await HashHelper.verify(oldPassword, accountPassword);

		if (!isPasswordValid) {
			throw new ForbiddenException(INCORRECT_PASSWORD);
		}

		const hashedPassword = await HashHelper.generate(newPassword);

		await AccountRepository.updateAccountPassword(accountId, hashedPassword);

		await SessionRepository.deleteAllSessionsByAccountId(accountId);

		return PASSWORD_CHANGED_SUCCESSFULLY;
	}

	static async forget(accountEmail) {
		const account = await AccountRepository.findAccountByEmail(accountEmail);

		if (!account) {
			return CHECK_MAIL_BOX;
		}

		if (account && account.resetToken) {
			const decodedResetToken = await TokenHelper.verifyResetToken(account.resetToken);

			if (decodedResetToken) {
				throw new ForbiddenException(ALREADY_HAVE_VALID_RESET_LINK);
			}
		}

		const resetToken = await TokenHelper.generateResetToken({ accountId: account._id, role: account.role });

		const resetLink = `${process.env.BASE_URL}:${process.env.PORT}/auth/password/reset/${resetToken}`;

		// TODO: Send Email
		console.log({ resetLink });

		await AccountRepository.updateAccountWithResetTokenByAccountId(account._id, resetToken);

		return CHECK_MAIL_BOX;
	}

	static async reset({ resetToken: givenAccountResetToken, password: givenAccountPassword }) {
		const { accountId } = await TokenHelper.verifyResetToken(givenAccountResetToken);

		const account = await AccountRepository.findAccountById(accountId);

		if (account && !account.resetToken) {
			throw new ForbiddenException(ALREADY_RESET_ACCOUNT);
		}

		const hashedPassword = await HashHelper.generate(givenAccountPassword);

		await AccountRepository.resetAccountPassword(accountId, hashedPassword);

		await SessionRepository.deleteAllSessionsByAccountId(accountId);

		return ACCOUNT_RESET_SUCCESSFULLY;
	}
}

module.exports = PasswordServices;
