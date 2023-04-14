const TokenHelper = require("./../../helpers/token");
const HashHelper = require("./../../helpers/hash");

const {
	FAILIURE_MESSAGES: { INCORRECT_PASSWORD },
	SUCCESS_MESSAGES: { PASSWORD_CHANGED_SUCCESSFULLY },
} = require("./../../constants/messages");
const BadRequestException = require("./../../Exceptions/common/badRequest.exception");
const UnAuthorizedException = require("./../../Exceptions/common/unAuthorized.exception");
const ForbiddenException = require("./../../Exceptions/common/forbidden.exception");

const AccountRepository = require("./../account/account.repositories");
const SessionRepository = require("./../session/session.repositories");
class PasswordServices {
	static async change({ oldPassword, newPassword, confirmNewPassword, accountId, accountPassword }) {
		const isPasswordValid = await HashHelper.verify(oldPassword, accountPassword);

		if (!isPasswordValid) {
			throw new ForbiddenException(INCORRECT_PASSWORD);
		}

		const hashedPassword = await HashHelper.generate(newPassword);

		await AccountRepository.updateAccountPassword(accountId, hashedPassword);

		await SessionRepository.deleteAllSessionsByAccountId(accountId);

		return PASSWORD_CHANGED_SUCCESSFULLY;
	}

	static async forget() {}

	static async reset() {}
}

module.exports = PasswordServices;
