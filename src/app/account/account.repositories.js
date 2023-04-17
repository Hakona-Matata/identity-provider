const {
	FAILIURE_MESSAGES: { ACCOUNT_NOT_FOUND, ACCOUNT_CREATION_FAILED },
} = require("./account.constants");

const AccountModel = require("./account.model");
const HashHelper = require("./../../helpers/hash");

class AccountRepository {
	static async create(accountPayload) {
		const password = await HashHelper.generate(accountPayload.password);

		return await AccountModel.create({ ...accountPayload, password });
	}

	static async findOneById(accountId) {
		return await AccountModel.findOne({
			_id: accountId,
		}).lean();
	}

	static async findOne(accountEmail) {
		return await AccountModel.findOne({
			email: accountEmail,
		}).lean();
	}

	static async updateOne(accountId, setPayload, unsetPayload = null) {
		return await AccountModel.updateOne(
			{ _id: accountId },
			{ $set: { ...setPayload, updatedAt: new Date() }, $unset: { ...unsetPayload } }
		);
	}
}

module.exports = AccountRepository;
