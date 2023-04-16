const InternalServerException = require("./../../Exceptions/common/internalServer.exception");
const otpModel = require("./otp.model");

const OTPModel = require("./otp.model");
class OTPRepository {
	static async create(payload) {
		const isOTPCreated = await OTPModel.create({ ...payload, by: "EMAIL" });

		if (!isOTPCreated) {
			throw new InternalServerException();
		}

		return isOTPCreated;
	}

	static async findOne(payload) {
		return await OTPModel.findOne({ ...payload, by: "EMAIL" }).lean();
	}

	static async updateOne(OTPId, setPayload, unsetPayload) {
		return await OTPModel.updateOne(
			{ _id: OTPId },
			{ $set: { ...setPayload, updatedAt: new Date() }, $unset: { ...unsetPayload } }
		);
	}

	static async deleteOne(OTPId) {
		return await otpModel.findOneAndDelete({ _id: OTPId });
	}
}

module.exports = OTPRepository;
