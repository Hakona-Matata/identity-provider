const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * TOTPSchema represents the schema of the TOTP collection in MongoDB.
 * @typedef {Object} TOTPSchema
 * @property {ObjectId} accountId - The ID of the account associated with this TOTP code.
 * @property {string} secret - The secret key generated for the TOTP code.
 * @property {boolean} isTemp - Indicates whether this is a temporary TOTP code or not.
 * @property {number} failedAttemptCount - The number of failed attempts to verify the TOTP code.
 * @property {Date} createdAt - The date when this TOTP document was created.
 * @property {Date} updatedAt - The date when this TOTP document was last updated.
 */

const TOTPSchema = new Schema(
	{
		accountId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Account",
			index: true,
			required: true,
		},
		secret: String,
		isTemp: {
			index: true,
			type: Boolean,
			default: true,
		},
		failedAttemptCount: { type: Number, default: 0 }, // number of wrong tries
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

module.exports = mongoose.model("TOTP", TOTPSchema);
