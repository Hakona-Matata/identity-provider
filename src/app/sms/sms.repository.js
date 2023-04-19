const SmsModel = require("./../otp/otp.model");

class SmsRepository {
	static async create(payload) {
		return await SmsModel.create({ ...payload, by: "SMS" });
	}

	static async findOne(payload) {
		return await SmsModel.findOne({ ...payload, by: "SMS" });
	}

	static async updateOne(smsId, setPayload, unsetPayload) {
		return await SmsModel.updateOne(
			{ _id: smsId },
			{ $set: { ...setPayload, updatedAt: new Date() }, $unset: { ...unsetPayload } }
		);
	}

	static async deleteOne(smsId) {
		return await SmsModel.deleteOne({ _id: smsId, by: "SMS" });
	}
}

module.exports = SmsRepository;
