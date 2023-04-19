const TotpModel = require("./totp.model");

class TotpRepository {
	static async create(payload) {
		return await TotpModel.create(payload);
	}

	static async findOne(payload) {
		return await TotpModel.findOne({ ...payload }).lean();
	}

	static async updateOne(totpId, setPayload, unsetPayload) {
		return await TotpModel.updateOne(
			{ _id: totpId },
			{ $set: { ...setPayload, updatedAt: new Date() }, $unset: { ...unsetPayload } }
		);
	}

	static async deleteOne(payload) {
		return await TotpModel.deleteOne({ ...payload });
	}

	static async delete(payload) {
		return await TotpModel.deleteMany(payload);
	}
}

module.exports = TotpRepository;
