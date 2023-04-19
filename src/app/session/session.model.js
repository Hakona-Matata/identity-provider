const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema(
	{
		accountId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Account",
			index: true,
			required: true,
		},
		accessToken: { type: String, index: true },
		refreshToken: { type: String, index: true },
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
