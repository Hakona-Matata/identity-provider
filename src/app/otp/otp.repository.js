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

	static async findOne(accountId) {
		return await OTPModel.findOne({ accountId, by: "EMAIL" }).lean();
	}

	static async deleteOne(OTPId) {
		return await otpModel.findOneAndDelete({ _id: OTPId });
	}
}

module.exports = OTPRepository;
