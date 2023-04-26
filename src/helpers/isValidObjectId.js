const mongoose = require("mongoose");

/**
 * Check if the input is a valid MongoDB ObjectId.
 * @param {string | mongoose.Types.ObjectId} objectId - The input to check.
 * @returns {boolean} - `true` if the input is a valid ObjectId, otherwise `false`.
 */
const isValidObjectId = (objectId) => {
	const regex = /^[0-9a-fA-F]{24}$/;
	return (typeof objectId === "string" && regex.test(objectId)) || objectId instanceof mongoose.Types.ObjectId;
};

module.exports = isValidObjectId;
