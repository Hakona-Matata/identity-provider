const mongoose = require("mongoose");

//==========================================================
const Schema = mongoose.Schema;

const SessionSchema = new Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			index: true,
			required: true,
		},
		accessToken: String,
		refreshToken: { type: String, index: true },
	},
	{
		versionKey: false,
	}
);

module.exports = mongoose.model("Session", SessionSchema);
