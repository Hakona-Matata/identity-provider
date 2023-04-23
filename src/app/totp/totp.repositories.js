const TotpModel = require("./totp.model");
const { BaseRepository } = require("./../../repository/index");

class TotpRepository extends BaseRepository {
	constructor() {
		super(TotpModel);
	}
}

module.exports = new TotpRepository();
