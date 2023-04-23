const BackupModel = require("./backup.model");

const { BaseRepository } = require("./../../repository/index");

class BackupRepository extends BaseRepository {
	constructor() {
		super(BackupModel);
	}
}

module.exports = new BackupRepository();
