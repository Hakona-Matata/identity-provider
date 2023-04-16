const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OTPSchema = new Schema(
	{
		accountId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Account",
			index: true,
			required: true,
		},
		hashedOTP: String,
		by: {
			// The OTP sending way!
			type: String,
			enum: ["EMAIL", "SMS"],
			required: true,
			index: true,
		},
		createdAt: {
			type: Date,
			default: Date.now,
			index: true,
			expires: "1h",
		},
		count: { type: Number, default: 0 }, // number of wrong tries
	},
	{
		versionKey: false,
	}
);

module.exports = mongoose.model("OTP", OTPSchema);
