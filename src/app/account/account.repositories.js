const AccountModel = require("./account.model");
const HashHelper = require("./../../helpers/hash");
const InternalServerException = require("./../../Exceptions/common/internalServer.exception");
const NotFoundException = require("../../Exceptions/common/notFound.exception");
const {
	FAILIURE_MESSAGES: { ACCOUNT_NOT_FOUND, ACCOUNT_CREATION_FAILED },
} = require("./../../constants/messages");
const BadRequestException = require("../../Exceptions/common/badRequest.exception");

class AccountRepository {
	static async create(accountPayload) {
		const password = await HashHelper.generate(accountPayload.password);

		const createdAccount = await AccountModel.create({ ...accountPayload, password });

		if (!createdAccount) {
			throw new BadRequestException(ACCOUNT_CREATION_FAILED);
		}

		return createdAccount;
	}

	static async findOneById(accountId) {
		const foundAccount = await AccountModel.findOne({
			_id: accountId,
		}).lean();

		if (!foundAccount) {
			throw NotFoundException(ACCOUNT_NOT_FOUND);
		}

		return foundAccount;
	}

	static async findOne(accountEmail) {
		const foundAccount = await AccountModel.findOne({
			email: accountEmail,
		}).lean();

		if (!foundAccount) {
			throw NotFoundException(ACCOUNT_NOT_FOUND);
		}

		return foundAccount;
	}

	static async updateOne(accountId, setPayload, unsetPayload = null) {
		const isAccountUpdated = await AccountModel.findOneAndUpdate(
			{ _id: accountId },
			{ $set: { ...setPayload, updatedAt: new Date() }, $unset: { ...unsetPayload } }
		);

		if (!isAccountUpdated) {
			throw InternalServerException();
		}

		return isAccountUpdated;
	}
}

module.exports = AccountRepository;
