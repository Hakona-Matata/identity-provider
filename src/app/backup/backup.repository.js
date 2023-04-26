/**
 * Represents a repository for the Backup collection.
 * @class
 * @extends BaseRepository
 */
const BackupModel = require("./backup.model");
const { BaseRepository } = require("./../../repository/index");

class BackupRepository extends BaseRepository {
	/**
	 * Creates an instance of BackupRepository.
	 * @constructor
	 */
	constructor() {
		super(BackupModel);
	}
}

module.exports = new BackupRepository();
