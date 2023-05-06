const AccountModel = require("./account.model");
const { BaseRepository } = require("./../../repository");

/**
 * A repository class for performing CRUD operations on the `Account` model.
 * @class
 * @extends BaseRepository
 */

class AccountRepository extends BaseRepository {
	constructor() {
		super(AccountModel);
	}
}

module.exports = new AccountRepository();
