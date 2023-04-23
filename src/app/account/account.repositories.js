const AccountModel = require("./account.model");
const { BaseRepository } = require("./../../repository/index");

class AccountRepository extends BaseRepository {
	constructor() {
		super(AccountModel);
	}
}

module.exports = new AccountRepository();
