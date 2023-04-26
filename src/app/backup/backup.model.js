/**
 * Defines the schema for the backup codes document in MongoDB
 * @typedef {Object} BackupSchema
 * @property {mongoose.Schema.Types.ObjectId} accountId - the ObjectId of the account the backup codes belong to
 * @property {String} code - the backup code
 * @property {Boolean} isTemp - whether the backup code is temporary or not
 * @property {Date} createdAt - the timestamp when the backup code was created
 * @property {Date} updatedAt - the timestamp when the backup code was last updated
 */

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * The Mongoose schema for the backup codes document in MongoDB
 * @type {mongoose.Schema<BackupSchema>}
 */
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

/**
 * The Mongoose model for the backup codes document in MongoDB
 * @type {mongoose.Model<mongoose.Document<BackupSchema>>}
 */
module.exports = mongoose.model("Backup", BackupSchema);
