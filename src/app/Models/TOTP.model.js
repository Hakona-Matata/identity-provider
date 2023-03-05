const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TOTPSchema = new Schema(
	{},
	{
		versionKey: false,
	}
);

module.exports = mongoose.model("TOTP", TOTPSchema);
