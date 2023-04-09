const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema(
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

		role: {
			type: String,
			enum: ["ADMIN", "RECRUITER", "CANDIDATE"],
			required: true,
		},

		phone: String,
		isPhoneVerified: { type: Boolean, default: false },

		countryCode: String,
		countryName: String,
		countryIso2: String,

		verificationToken: String,
		isVerified: { type: Boolean, default: false },
		isVerifiedAt: Date,

		// Account locked or not?
		activationToken: String,
		isActive: {
			type: Boolean,
			default: true,
		},
		activeStatusChangedAt: Date,

		isDeleted: {
			type: Boolean,
			default: false,
		},
		isDeletedAt: Date,

		resetToken: String,
		resetAt: Date,

		isOTPEnabled: { type: Boolean, default: false },
		OTPEnabledAt: Date,

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

AccountSchema.index(
	{ isDeleted: 1 },
	{
		expireAfterSeconds: +process.env.DELETE_IN_30_DAYS,
		partialFilterExpression: { isDeleted: true },
	}
);

module.exports = mongoose.model("Account", AccountSchema);
