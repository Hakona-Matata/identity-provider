const OtpModel = require("./otp.model");

const { BaseRepository } = require("./../../repository/index");

class OtpRepository extends BaseRepository {
	constructor() {
		super(OtpModel);
	}

	async insertOne(payload) {
		return await super.insertOne({ ...payload, by: "EMAIL" });
	}

	async findOne(payload) {
		return await super.findOne({ ...payload, by: "EMAIL" });
	}

	async updateOne(filter, setPayload, unsetPayload) {
		return await super.updateOne({ ...filter, by: "EMAIL" }, setPayload, unsetPayload);
	}

	async deleteOne(filter) {
		return await super.deleteOne({ ...filter, by: "EMAIL" });
	}
}

module.exports = new OtpRepository();
