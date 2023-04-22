const mongoose = require("mongoose");

function isValidObject(objectId) {
	if (typeof objectId === "string") {
		return mongoose.Types.ObjectId.isValid(objectId);
	} else if (objectId instanceof mongoose.Types.ObjectId) {
		return true;
	}
	return false;
}

module.exports = isValidObject;
