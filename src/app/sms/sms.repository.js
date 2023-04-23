const SmsModel = require("./../otp/otp.model");

const { BaseRepository } = require("./../../repository/index");

class SmsRepository extends BaseRepository {
	constructor() {
		super(SmsModel);
	}

	async insertOne(payload) {
		return await super.insertOne({ ...payload, by: "SMS" });
	}

	async findOne(payload) {
		return await super.findOne({ ...payload, by: "SMS" });
	}

	async updateOne(filter, setPayload, unsetPayload) {
		return await super.updateOne({ ...filter, by: "SMS" }, setPayload, unsetPayload);
	}

	async deleteOne(filter) {
		return await super.deleteOne({ ...filter, by: "SMS" });
	}
}

module.exports = new SmsRepository();
