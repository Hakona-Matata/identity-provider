/**
 * The TotpRepository class handles database operations related to TOTP.
 * @class
 * @classdesc A class that contains methods to perform CRUD operations for TOTP data in the database.
 * @requires ./totp.model
 * @requires ./../../repository/index
 */
const TotpModel = require("./totp.model");
const { BaseRepository } = require("./../../repository/index");

class TotpRepository extends BaseRepository {
	constructor() {
		super(TotpModel);
	}
}

module.exports = new TotpRepository();
