const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BackupSchema = new Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
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
		isUsedAt: Date,
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

module.exports = mongoose.model("Backup", BackupSchema);
