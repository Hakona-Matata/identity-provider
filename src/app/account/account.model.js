const { roles } = require("./../../constants/index");

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
			enum: Object.values(roles),
			required: true,
		},

		phone: String,
		isPhoneVerified: { type: Boolean, default: false },
		phoneVerifiedAt: Date,

		country: {
			name: String,
			code: String,
			iso2: String,
		},

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
		// Only delete document after 30 days if isDeleted value is true!
		isDeletedAt: {
			type: Date,
			index: { expireAfterSeconds: 60 * 60 * 24 * 30, partialFilterExpression: { isDeleted: true } },
		},

		resetToken: String,
		resetAt: Date,

		isOtpEnabled: { type: Boolean, default: false },
		otpEnabledAt: Date,

		isSmsEnabled: { type: Boolean, default: false },
		smsEnabledAt: Date,

		isTotpEnabled: { type: Boolean, default: false },
		totpEnabledAt: Date,

		isBackupEnabled: { type: Boolean, default: false },
		backupEnabledAt: Date,
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

module.exports = mongoose.model("Account", AccountSchema);
