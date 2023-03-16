const mongoose = require("mongoose");

module.exports = (value) => {
	// (1) Is it valid hex? Not all characters? Not all digits?
	const digitsLength = value.match(/\d/g).length;
	if (digitsLength == 0 || digitsLength == 24) {
		return false;
	}

	// (1) valid mongodb object ID?
	const isValidMongodbObjectID = mongoose.Types.ObjectId.isValid(value);
	if (!isValidMongodbObjectID) {
		return false;
	}

	return true;
};
