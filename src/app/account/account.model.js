const { roles } = require("./../../constants/index");

const mongoose = require("mongoose");

/**
 *
 * The account schema.
 *
 * @type {import("mongoose").Schema<AccountDocument>}
 */

/**

@typedef {Object} Country
@property {String} name - The name of the country.
@property {String} code - The code of the country.
@property {String} iso2 - The iso2 of the country.
 */

/**
 *
 * @typedef {Object} AccountDocument
 * @property {String} userName - The username of the account.
 * @property {String} email - The email of the account.
 * @property {String} password - The hashed password of the account.
 * @property {Date} passwordChangedAt - The date the password was last changed.
 * @property {String} role - The role of the account.
 * @property {String} phone - The phone number of the account.
 * @property {Boolean} isPhoneVerified - Whether the phone number is verified or not.
 * @property {Date} phoneVerifiedAt - The date the phone number was last verified.
 * @property {Country} country - The country of the account.
 * @property {String} verificationToken - The token used to verify the account.
 * @property {Boolean} isVerified - Whether the account is verified or not.
 * @property {Date} isVerifiedAt - The date the account was last verified.
 * @property {String} activationToken - The token used to activate the account.
 * @property {Boolean} isActive - Whether the account is active or not.
 * @property {Date} activeStatusChangedAt - The date the active status was last changed.
 * @property {Boolean} isDeleted - Whether the account is deleted or not.
 * @property {Date} isDeletedAt - The date the account was last deleted.
 * @property {String} resetToken - The token used to reset the account password.
 * @property {Date} resetAt - The date the account password was last reset.
 * @property {Boolean} isOtpEnabled - Whether the account has OTP enabled or not.
 * @property {Date} otpEnabledAt - The date OTP was last enabled.
 * @property {Boolean} isSmsEnabled - Whether the account has SMS enabled or not.
 * @property {Date} smsEnabledAt - The date SMS was last enabled.
 * @property {Boolean} isTotpEnabled - Whether the account has TOTP enabled or not.
 * @property {Date} totpEnabledAt - The date TOTP was last enabled.
 * @property {Boolean} isBackupEnabled - Whether the account has backup enabled or not.
 * @property {Date} backupEnabledAt - The date backup was last enabled.
 * @property {Date} createdAt - The date the account was created.
 * @property {Date} updatedAt - The date the account was last updated.
 */
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
