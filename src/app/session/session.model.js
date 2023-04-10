const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema(
	{
		accountId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Account",
			index: true,
			required: true,
		},
		accessToken: String,
		refreshToken: String,
		createdAt: {
			type: Date,
			default: Date.now,
			index: true,
			expires: "24h",
		},
	},
	{
		versionKey: false,
	}
);

module.exports = mongoose.model("Session", SessionSchema);
