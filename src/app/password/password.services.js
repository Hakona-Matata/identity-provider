const ForbiddenException = require("./../../Exceptions/common/forbidden.exception");
const AccountRepository = require("./../account/account.repositories");
const SessionRepository = require("./../session/session.repositories");
const TokenHelper = require("./../../helpers/token");
const HashHelper = require("./../../helpers/hash");
const {
	SUCCESS_MESSAGES: { PASSWORD_CHANGED_SUCCESSFULLY, CHECK_MAIL_BOX, ACCOUNT_RESET_SUCCESSFULLY },
	FAILIURE_MESSAGES: { INCORRECT_PASSWORD, ALREADY_HAVE_VALID_RESET_LINK, ALREADY_RESET_ACCOUNT },
} = require("./password.constants");

class PasswordServices {
	static async change({ oldPassword, newPassword, accountId, accountPassword }) {
		const isPasswordValid = await HashHelper.verify(oldPassword, accountPassword);

		if (!isPasswordValid) {
			throw new ForbiddenException(INCORRECT_PASSWORD);
		}

		const hashedPassword = await HashHelper.generate(newPassword);

		await AccountRepository.updateOne(accountId, { password: hashedPassword, passwordChangedAt: new Date() });

		await SessionRepository.deleteMany(accountId);

		return PASSWORD_CHANGED_SUCCESSFULLY;
	}

	static async forget(accountEmail) {
		const account = await AccountRepository.findOne(accountEmail);

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

		await AccountRepository.updateOne(account._id, { resetToken, resetAt: new Date() }, { resetToken: 1 });

		return CHECK_MAIL_BOX;
	}

	static async reset({ resetToken: givenAccountResetToken, password: givenAccountPassword }) {
		const { accountId } = await TokenHelper.verifyResetToken(givenAccountResetToken);

		const account = await AccountRepository.findOneById(accountId);

		if (account && !account.resetToken) {
			throw new ForbiddenException(ALREADY_RESET_ACCOUNT);
		}

		const hashedPassword = await HashHelper.generate(givenAccountPassword);

		await AccountRepository.updateOne(accountId, { password: hashedPassword, resetAt: new Date() }, { resetToken: 1 });

		await SessionRepository.deleteMany(accountId);

		return ACCOUNT_RESET_SUCCESSFULLY;
	}
}

module.exports = PasswordServices;
