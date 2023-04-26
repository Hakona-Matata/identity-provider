const SmsModel = require("./../otp/otp.model");

const { BaseRepository } = require("./../../repository/index");

class SmsRepository extends BaseRepository {
	constructor() {
		super(SmsModel);
	}

	async insertOne(payload) {
		return await super.insertOne({ ...payload, sendingMethod: "SMS" });
	}

	async findOne(payload) {
		return await super.findOne({ ...payload, sendingMethod: "SMS" });
	}

	async updateOne(filter, setPayload, unsetPayload) {
		return await super.updateOne({ ...filter, sendingMethod: "SMS" }, setPayload, unsetPayload);
	}

	async deleteOne(filter) {
		return await super.deleteOne({ ...filter, sendingMethod: "SMS" });
	}
}

module.exports = new SmsRepository();
