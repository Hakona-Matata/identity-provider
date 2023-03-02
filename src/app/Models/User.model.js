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
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

module.exports = mongoose.model("User", UserSchema);
