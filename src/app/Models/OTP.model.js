const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OTPSchema = new Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			index: true,
			required: true,
		},
		otp: String,
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		versionKey: false,
	}
);

OTPSchema.index(
	{ createdAt: 1 },
	{ expireAfterSeconds: +process.env.OTP_EXPIRES_IN_SECONDS }
);

module.exports = mongoose.model("OTP", OTPSchema);
