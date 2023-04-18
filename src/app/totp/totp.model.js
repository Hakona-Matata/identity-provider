const mongoose = require("mongoose");

const Schema = mongoose.Schema;

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
		count: { type: Number, default: 0 }, // number of wrong tries
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

module.exports = mongoose.model("TOTP", TOTPSchema);
