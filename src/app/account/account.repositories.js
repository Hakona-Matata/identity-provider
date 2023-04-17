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

	static async findOne(payload) {
		return await AccountModel.findOne({
			...payload,
		}).lean();
	}

	static async updateOne(accountId, setPayload, unsetPayload = null) {
		return await AccountModel.updateOne(
			{ _id: accountId },
			{ $set: { ...setPayload, updatedAt: new Date() }, $unset: { ...unsetPayload } }
		);
	}

	static async deleteOne(accountId) {
		return await AccountModel.deleteOne({ _id: accountId });
	}
}

module.exports = AccountRepository;
