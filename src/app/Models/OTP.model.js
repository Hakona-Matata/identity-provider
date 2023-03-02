const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OTPSchema = new Schema(
	{},
	{
		timestamps: true,
		versionKey: false,
	}
);

module.exports = mongoose.model("OTP", OTPSchema);
