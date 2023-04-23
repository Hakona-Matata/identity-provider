const mongoose = require("mongoose");

const isValidObjectId = (objectId) => {
	const regex = /^[0-9a-fA-F]{24}$/;
	return (typeof objectId === "string" && regex.test(objectId)) || objectId instanceof mongoose.Types.ObjectId;
};

module.exports = isValidObjectId;
