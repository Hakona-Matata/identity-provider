const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BackupSchema = new Schema(
	{
		accountId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Account",
			index: true,
			required: true,
		},
		code: {
			type: String,
			index: true,
		},
		isTemp: {
			type: Boolean,
			index: true,
			default: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

module.exports = mongoose.model("Backup", BackupSchema);
