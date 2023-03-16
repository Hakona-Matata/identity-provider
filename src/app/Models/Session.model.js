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
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		versionKey: false,
	}
);

// life span of session document is the time of refresh token!

SessionSchema.index(
	{ createdAt: 1 },
	{ expireAfterSeconds: +process.env.REFRESH_TOKEN_DELETE_DOCUMENT }
);

module.exports = mongoose.model("Session", SessionSchema);
