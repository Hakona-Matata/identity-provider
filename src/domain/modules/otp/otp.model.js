const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * @typedef {Object} Otp
 * @property {string} _id - The unique ID of the OTP
 * @property {ObjectId} accountId - The account ID that the OTP belongs to
 * @property {string} hashedOtp - The hashed OTP
 * @property {string} sendingMethod - The sending method of the OTP (EMAIL or SMS)
 * @property {Date} createdAt - The creation date of the OTP
 * @property {number} failedAttemptCount - The number of failed attempts to verify the OTP
 */

/**
 * Mongoose schema for the OTP collection
 * @type {import('mongoose').Schema<Otp, import('mongoose').Model<Otp>>}
 */
const OtpSchema = new Schema(
	{
		accountId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Account",
			index: true,
			required: true,
		},
		hashedOtp: String,
		sendingMethod: {
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
		failedAttemptCount: { type: Number, default: 0 }, // Number of wrong tries
	},
	{
		versionKey: false,
	}
);

module.exports = mongoose.model("OTP", OtpSchema);
