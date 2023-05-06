/**
 * Mongoose Model for Session
 * @module SessionModel
 */

const mongoose = require("mongoose");

/**
 * Mongoose schema for Session collection
 * @class
 * @property {mongoose.Schema.Types.ObjectId} accountId - The ID of the associated account in the Account collection.
 * @property {string} accessToken - The access token associated with the session.
 * @property {string} refreshToken - The refresh token associated with the session.
 * @property {Date} createdAt - The creation date of the session.
 */
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
