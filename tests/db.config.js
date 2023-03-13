const mongoose = require("mongoose");

const connect = async () => {
	try {
		mongoose.set("strictQuery", true);
		return await mongoose.connect(process.env.MONGO_URL);
	} catch (error) {
		console.error(error);
	}
};

const disconnect = async () => {
	try {
		return await mongoose.disconnect();
	} catch (error) {
		console.error(error);
	}
};

module.exports = { connect, disconnect };
