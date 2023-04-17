const InternalServerException = require("./../../Exceptions/common/internalServer.exception");

const OtpModel = require("./otp.model");
class OtpRepository {
	static async create(payload) {
		const isOtpCreated = await OtpModel.create({ ...payload, by: "EMAIL" });

		if (!isOtpCreated) {
			throw new InternalServerException();
		}

		return isOtpCreated;
	}

	static async findOne(payload) {
		return await OtpModel.findOne({ ...payload, by: "EMAIL" }).lean();
	}

	static async updateOne(OtpId, setPayload, unsetPayload) {
		return await OtpModel.updateOne(
			{ _id: OtpId },
			{ $set: { ...setPayload, updatedAt: new Date() }, $unset: { ...unsetPayload } }
		);
	}

	static async deleteOne(OtpId) {
		return await OtpModel.findOneAndDelete({ _id: OtpId });
	}
}

module.exports = OtpRepository;
