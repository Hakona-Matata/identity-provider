const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
	{
		userName: {
			type: String,
			unique: true,
			index: true,
		},
		email: {
			type: String,
			unique: true,
			index: true,
		},
		password: String,
		passwordChangedAt: Date,

		verificationToken: String,
		isVerified: { type: Boolean, default: false },
		isVerifiedAt: Date,

		isActive: {
			type: Boolean,
			default: true,
		},
		activeStatusChangedAt: Date,
		activationToken: String,

		isDeleted: {
			type: Boolean,
			default: false,
		},
		isDeletedAt: Date,

		resetToken: String,
		resetAt: Date,

		isOTPEnabled: { type: Boolean, default: false },
		OTPEnabledAt: Date,

		phoneNumber: String,
		isPhoneVerified: { type: Boolean, default: false },

		countryCode: String,
		countryName: String,
		countryIso2: String,

		isSMSEnabled: { type: Boolean, default: false },
		SMSEnabledAt: Date,

		isTOTPEnabled: { type: Boolean, default: false },
		TOTPEnabledAt: Date,

		isBackupEnabled: { type: Boolean, default: false },
		BackupEnabledAt: Date,
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

module.exports = mongoose.model("User", UserSchema);
