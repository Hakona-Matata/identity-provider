const AccountModel = require("./account.model");
const HashHelper = require("./../../helpers/hash");

class AccountRepository {
	static async createAccount(accountPayload) {
		const password = await HashHelper.generate(accountPayload.password);

		return await AccountModel.create({ ...accountPayload, password });
	}

	static async findAccountById(accountId) {
		return await AccountModel.findOne({
			_id: accountId,
		}).lean();
	}

	static async findAccountByEmail(accountEmail) {
		return await AccountModel.findOne({
			email: accountEmail,
		}).lean();
	}

	static async updateAccountWithVerificationToken(accountId, verificationToken) {
		return await AccountModel.findOneAndUpdate(
			{ _id: accountId },
			{
				$set: { verificationToken },
			}
		);
	}

	static async updateAccountToBeVerified(accountId) {
		return await AccountModel.findOneAndUpdate(
			{ _id: accountId },
			{
				$set: { isVerified: true, isVerifiedAt: new Date() },
				$unset: { verificationToken: 1 },
			}
		);
	}

	static async updateAccountPassword(accountId, accountNewPassword) {
		return await AccountModel.findOneAndUpdate(
			{ _id: accountId },
			{
				$set: { password: accountNewPassword, passwordChangedAt: new Date() },
			}
		);
	}
}

module.exports = AccountRepository;
