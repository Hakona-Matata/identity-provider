const mongoose = require("mongoose");

//==============================================================
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
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

module.exports = mongoose.model("User", UserSchema);
