const BackupModel = require("./backup.model");

class BackupRepository {
	static async createMany(backupCodesList) {
		return await BackupModel.insertMany(backupCodesList);
	}

	static async findOne(payload) {
		return await BackupModel.findOne({ ...payload }).lean();
	}

	static async find(payload) {
		return await BackupModel.find({ ...payload }).lean();
	}

	static async update(filter, setPayload, unsetPayload) {
		return await BackupModel.updateMany({ ...filter }, { $set: { ...setPayload }, $unset: { ...unsetPayload } });
	}

	static async deleteOne(paylaod) {
		return await BackupModel.deleteOne({ ...paylaod });
	}

	static async delete(payload) {
		return await BackupModel.deleteMany({ ...payload });
	}
}

module.exports = BackupRepository;
