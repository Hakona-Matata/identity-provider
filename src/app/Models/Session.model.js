const mongoose = require("mongoose");

//==========================================================
const Schema = mongoose.Schema;

const SessionSchema = new Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		accessToken: String,
		refreshToken: String,
	},
	{
		versionKey: false,
	}
);

module.exports = mongoose.model("Session", SessionSchema);
